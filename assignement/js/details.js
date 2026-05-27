// Builds a complete iframe page used while API data is still loading.
const loadingPage = (message) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"><\/script>
        <title>${message}</title>
    </head>
    <body class="bg-gray-100 p-4 text-gray-800 dark:bg-slate-800 dark:text-slate-200 sm:p-6">
        <div class="flex min-h-screen items-center justify-center">
            <p class="rounded-xl bg-gray-100 p-4 text-center text-base shadow-md dark:bg-slate-700 sm:text-lg">
                ${message}
            </p>
        </div>
    </body>
    </html>
`;

// Wraps detail content inside a complete iframe page.
const detailsPage = (title, content) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"><\/script>
        <title>${title}</title>
    </head>
    <body class="bg-gray-100 p-3 text-gray-800 dark:bg-slate-800 dark:text-slate-200 sm:p-5 md:p-6">
        <main class="mx-auto max-w-6xl">
            ${content}
        </main>
    </body>
    </html>
`;

/**
 * Opens a modal by updating its visibility classes and sets the content of the iframe.
 *
 * @param {HTMLElement} modal - The modal element to be displayed.
 * @param {HTMLIFrameElement} frame - The iframe element within the modal to load content into.
 * @param {string} loadingMessage - The message to display while the content is loading.
 * @return {void} This function does not return a value.
 */
function openModal(modal, frame, loadingMessage) {
    // The modal starts hidden; replacing "hidden" with "flex" displays it centered on the page.
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Show an instant loading page while the API request is running.
    frame.srcdoc = loadingPage(loadingMessage);
}

/**
 * Closes the modal by hiding it and clearing the content of the associated iframe.
 *
 * @param {HTMLElement} modal - The modal element to be closed.
 * @param {HTMLIFrameElement} frame - The iframe element whose content needs to be cleared.
 * @return {void} This method does not return a value.
 */
function closeModal(modal, frame) {
    // Hide the overlay again.
    modal.classList.add('hidden');
    modal.classList.remove('flex');

    // Clear the iframe so old details are not visible next time it opens.
    frame.srcdoc = '';
}

/**
 * Generates an HTML card representation of a show.
 *
 * @param {Object} show - The show data to create the card for.
 * @param {string} show.name - The name of the show.
 * @param {Object} [show.image] - The image object for the show.
 * @param {string} [show.image.medium] - The medium size URL of the show's image.
 * @param {Object} [show.rating] - The rating object for the show.
 * @param {number} [show.rating.average] - The average rating of the show.
 * @param {number} show.id - The unique identifier of the show.
 * @return {string} The HTML string representation of the show card.
 */
function createShowCard(show) {
    // This card is reused on both the home page and the shows search page.
    return `<div class="container rounded-lg p-2 shadow-md">
                <img class="mb-2 w-full rounded-lg"
                     src="${show.image?.medium ?? 'https://dummyimage.com/210x295/cccccc/000000&text=No+Image'}"
                     alt="${show.name}">
                <h5 class="mb-2 text-lg font-semibold">${show.name}</h5>
                <p class="mb-3 text-gray-600 dark:text-slate-300">Rating: ${show.rating.average ?? 'N/A'}</p>
                <button class="inline-block rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
                        onclick="openShowDetails(${show.id})"
                        type="button">
                    View Show
                </button>
            </div>`;
}

/**
 * Creates an HTML string representing a card for an actor with optional extra details.
 *
 * @param {Object} actor - The actor object containing details such as name, gender, country, and image.
 * @param {boolean} [showExtraDetails=false] - Indicates whether to display additional details such as gender and birthday.
 * @return {string} An HTML string representing the actor card.
 */
function createActorCard(actor, showExtraDetails = false) {
    // The home page only shows country, while the actor page shows more actor information.
    const details = showExtraDetails
        ? `<p class="mb-1 text-gray-600 dark:text-slate-300">Gender: ${actor.gender ?? 'Unknown'}</p>
           <p class="mb-1 text-gray-600 dark:text-slate-300">Country: ${actor.country?.name ?? 'Unknown'}</p>
           <p class="mb-3 text-gray-600 dark:text-slate-300">Birthday: ${actor.birthday ?? 'Unknown'}</p>`
        : `<p class="mb-3 text-gray-600 dark:text-slate-300">Country: ${actor.country?.name ?? 'Unknown'}</p>`;

    // This card is reused on both the home page and the actor search page.
    return `<div class="container rounded-lg p-2 shadow-md">
                <img class="mb-2 w-full rounded-lg"
                     src="${actor.image?.medium ?? 'https://dummyimage.com/210x295/cccccc/000000&text=No+Image'}"
                     alt="${actor.name}">
                <h5 class="mb-2 text-lg font-semibold">${actor.name}</h5>
                ${details}
                <button class="inline-block rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
                        onclick="openActorDetails(${actor.id})"
                        type="button">
                    View Actor
                </button>
            </div>`;
}

/**
 * Renders detailed information about a TV show, including its seasons and episodes, as an HTML string.
 *
 * @param {Object} show - An object representing the TV show.
 * @param {string} show.name - The name of the show.
 * @param {Object} [show.image] - An object containing image information for the show.
 * @param {string} [show.image.medium] - The URL for the medium-sized image.
 * @param {Object} [show.rating] - An object containing the show's rating details.
 * @param {number} [show.rating.average] - The average rating of the show.
 * @param {string} [show.status] - The current status of the show (e.g., "Running", "Ended").
 * @param {string} [show.language] - The language in which the show is produced.
 * @param {string} [show.premiered] - The date the show premiered.
 * @param {string[]} [show.genres] - An array of genres associated with the show.
 * @param {string} [show.summary] - A summary or description of the show.
 *
 * @param {Array<Object>} seasons - An array of objects representing the seasons of the show.
 * @param {number} seasons[].number - The season number.
 * @param {number} [seasons[].episodeOrder] - The number of episodes in the season.
 * @param {string} [seasons[].premiereDate] - The premiere date of the season.
 * @param {string} [seasons[].endDate] - The end date of the season.
 *
 * @param {Array<Object>} episodes - An array of objects representing the episodes of the show.
 * @param {number} episodes[].season - The season number to which the episode belongs.
 * @param {number} episodes[].number - The episode number within the season.
 * @param {string} episodes[].name - The name of the episode.
 * @param {string} [episodes[].airdate] - The air date of the episode.
 * @param {number} [episodes[].runtime] - The runtime of the episode, in minutes.
 *
 * @return {string} An HTML string containing the rendered details of the show, seasons, and episodes.
 */
function renderShowDetails(show, seasons, episodes) {
    // Build the season list before inserting it into the details page.
    const seasonsHtml = seasons.map((season) => {
        return `<li class="rounded-lg bg-gray-100 p-3 shadow-sm dark:bg-slate-700">
                    <strong class="text-gray-800 dark:text-slate-100">Season ${season.number}</strong>
                    <p class="mt-1 text-sm text-gray-600 dark:text-slate-300">Episodes: ${season.episodeOrder ?? 'Unknown'}</p>
                    <p class="text-sm text-gray-600 dark:text-slate-300">Premiere: ${season.premiereDate ?? 'Unknown'}</p>
                    <p class="text-sm text-gray-600 dark:text-slate-300">End: ${season.endDate ?? 'Unknown'}</p>
                </li>`;
    }).join('');

    // Build the episode list before inserting it into the details page.
    const episodesHtml = episodes.map((episode) => {
        return `<li class="rounded-lg bg-gray-100 p-3 shadow-sm dark:bg-slate-700">
                    <strong class="text-gray-800 dark:text-slate-100">S${episode.season} E${episode.number}: ${episode.name}</strong>
                    <p class="mt-1 text-sm text-gray-600 dark:text-slate-300">Air date: ${episode.airdate || 'Unknown'}</p>
                    <p class="text-sm text-gray-600 dark:text-slate-300">Runtime: ${episode.runtime ? `${episode.runtime} minutes` : 'Unknown'}</p>
                </li>`;
    }).join('');

    return detailsPage(show.name, `
        <section class="mb-4 rounded-xl bg-gray-100 p-3 shadow-md dark:bg-slate-700 sm:p-5 md:mb-6">
            <div class="grid gap-4 md:grid-cols-[180px_1fr] lg:grid-cols-[220px_1fr]">
                <img class="mx-auto w-40 rounded-lg shadow-md sm:w-48 md:w-full"
                     src="${show.image?.medium ?? 'https://dummyimage.com/210x295/cccccc/000000&text=No+Image'}"
                     alt="${show.name}">

                <div>
                    <h1 class="mb-3 text-center text-2xl font-bold text-gray-800 dark:text-slate-100 sm:text-3xl md:text-left">${show.name}</h1>

                    <div class="mb-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800"><strong>Rating:</strong> ${show.rating.average ?? 'N/A'}</p>
                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800"><strong>Status:</strong> ${show.status}</p>
                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800"><strong>Language:</strong> ${show.language ?? 'Unknown'}</p>
                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800"><strong>Premiered:</strong> ${show.premiered ?? 'Unknown'}</p>
                    </div>

                    <p class="mb-4 text-sm text-gray-600 dark:text-slate-300">
                        <strong class="text-gray-800 dark:text-slate-100">Genres:</strong>
                        ${show.genres.length ? show.genres.join(', ') : 'Unknown'}
                    </p>

                    <div class="text-sm leading-relaxed text-gray-700 dark:text-slate-300 sm:text-base">
                        ${show.summary ?? '<p>No summary available.</p>'}
                    </div>
                </div>
            </div>
        </section>

        <section class="mb-4 rounded-xl bg-gray-100 p-3 shadow-md dark:bg-slate-700 sm:p-5 md:mb-6">
            <h2 class="mb-3 text-xl font-semibold text-gray-800 dark:text-slate-100 sm:text-2xl">Seasons</h2>
            <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                ${seasonsHtml || '<li class="text-gray-600 dark:text-slate-300">No seasons found.</li>'}
            </ul>
        </section>

        <section class="rounded-xl bg-gray-100 p-3 shadow-md dark:bg-slate-700 sm:p-5">
            <h2 class="mb-3 text-xl font-semibold text-gray-800 dark:text-slate-100 sm:text-2xl">Episodes</h2>
            <ul class="grid grid-cols-1 gap-3 lg:grid-cols-2">
                ${episodesHtml || '<li class="text-gray-600 dark:text-slate-300">No episodes found.</li>'}
            </ul>
        </section>
    `);
}

/**
 * Creates a credit item for a given credit and role, returning an HTML string to display the credit's details.
 *
 * @param {Object} credit - The credit information object, which should contain an `_embedded.show` property with show details.
 * @param {string} role - The role of the individual in the show.
 * @return {string} An HTML string representing the credit's details, or an empty string if the required show information is not available.
 */
function createCreditItem(credit, role) {
    const show = credit._embedded?.show;

    if (!show) {
        return '';
    }

    return `<li class="rounded-lg bg-gray-100 p-3 shadow-sm dark:bg-slate-700">
                <div class="grid gap-3 sm:grid-cols-[70px_1fr]">
                    <img class="w-20 rounded shadow sm:w-full"
                         src="${show.image?.medium ?? 'https://dummyimage.com/210x295/cccccc/000000&text=No+Image'}"
                         alt="${show.name}">
                    <div>
                        <strong class="text-gray-800 dark:text-slate-100">${show.name}</strong>
                        <p class="mt-1 text-sm text-gray-600 dark:text-slate-300">Role: ${role}</p>
                        <p class="text-sm text-gray-600 dark:text-slate-300">Status: ${show.status ?? 'Unknown'}</p>
                        <p class="text-sm text-gray-600 dark:text-slate-300">Rating: ${show.rating?.average ?? 'N/A'}</p>
                        <p class="text-sm text-gray-600 dark:text-slate-300">Genres: ${show.genres?.length ? show.genres.join(', ') : 'Unknown'}</p>
                    </div>
                </div>
            </li>`;
}

/**
 * Renders the details of an actor, including their basic information, cast credits, and crew credits.
 *
 * @param {object} actor - The actor object containing information such as name, image, gender, country, birthday, and deathday.
 * @param {Array<object>} castCredits - Array of cast credit objects, each representing an actor's role in specific productions.
 * @param {Array<object>} crewCredits - Array of crew credit objects, each representing an actor's contribution to productions in non-cast roles.
 * @return {string} A string of HTML markup displaying the actor's details, cast credits, and crew credits.
 */
function renderActorDetails(actor, castCredits, crewCredits) {
    const castCreditsHtml = castCredits.map((credit) => {
        return createCreditItem(credit, 'Cast');
    }).join('');

    const crewCreditsHtml = crewCredits.map((credit) => {
        return createCreditItem(credit, credit.type ?? 'Crew');
    }).join('');

    return detailsPage(actor.name, `
        <section class="mb-4 rounded-xl bg-gray-100 p-3 shadow-md dark:bg-slate-700 sm:p-5 md:mb-6">
            <div class="grid gap-4 md:grid-cols-[180px_1fr] lg:grid-cols-[220px_1fr]">
                <img class="mx-auto w-40 rounded-lg shadow-md sm:w-48 md:w-full"
                     src="${actor.image?.medium ?? 'https://dummyimage.com/210x295/cccccc/000000&text=No+Image'}"
                     alt="${actor.name}">

                <div>
                    <h1 class="mb-3 text-center text-2xl font-bold text-gray-800 dark:text-slate-100 sm:text-3xl md:text-left">${actor.name}</h1>

                    <div class="mb-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800"><strong>Gender:</strong> ${actor.gender ?? 'Unknown'}</p>
                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800"><strong>Country:</strong> ${actor.country?.name ?? 'Unknown'}</p>
                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800"><strong>Birthday:</strong> ${actor.birthday ?? 'Unknown'}</p>
                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800"><strong>Deathday:</strong> ${actor.deathday ?? 'N/A'}</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="mb-4 rounded-xl bg-gray-100 p-3 shadow-md dark:bg-slate-700 sm:p-5 md:mb-6">
            <h2 class="mb-3 text-xl font-semibold text-gray-800 dark:text-slate-100 sm:text-2xl">Cast Credits</h2>
            <ul class="grid grid-cols-1 gap-3 lg:grid-cols-2">
                ${castCreditsHtml || '<li class="text-gray-600 dark:text-slate-300">No cast credits found.</li>'}
            </ul>
        </section>

        <section class="rounded-xl bg-gray-100 p-3 shadow-md dark:bg-slate-700 sm:p-5">
            <h2 class="mb-3 text-xl font-semibold text-gray-800 dark:text-slate-100 sm:text-2xl">Crew Credits</h2>
            <ul class="grid grid-cols-1 gap-3 lg:grid-cols-2">
                ${crewCreditsHtml || '<li class="text-gray-600 dark:text-slate-300">No crew credits found.</li>'}
            </ul>
        </section>
    `);
}

/**
 * Opens a modal to display detailed information about a TV show, including its seasons and episodes.
 *
 * @param {number|string} showId - The unique identifier of the TV show to fetch details for.
 * @return {void} This method does not return a value.
 */
function openShowDetails(showId) {
    const showModal = document.querySelector('#show-modal');
    const showDetailsFrame = document.querySelector('#show-details-frame');

    openModal(showModal, showDetailsFrame, 'Loading show details...');

    Promise.all([
        fetch(`https://api.tvmaze.com/shows/${showId}`).then(response => response.json()),
        fetch(`https://api.tvmaze.com/shows/${showId}/seasons`).then(response => response.json()),
        fetch(`https://api.tvmaze.com/shows/${showId}/episodes`).then(response => response.json())
    ])
        .then(([show, seasons, episodes]) => {
            showDetailsFrame.srcdoc = renderShowDetails(show, seasons, episodes);
        });
}

/**
 * Closes the show details modal by hiding the associated modal
 * and the details frame elements.
 *
 * @return {void} No return value.
 */
function closeShowDetails() {
    closeModal(
        document.querySelector('#show-modal'),
        document.querySelector('#show-details-frame')
    );
}

/**
 * Opens and displays details about a specific actor in a modal.
 *
 * @param {number|string} actorId - The unique identifier of the actor whose details are to be fetched.
 * @return {void} No return value. The actor details will be displayed in a modal on the page.
 */
function openActorDetails(actorId) {
    const actorModal = document.querySelector('#actor-modal');
    const actorDetailsFrame = document.querySelector('#actor-details-frame');

    openModal(actorModal, actorDetailsFrame, 'Loading actor details...');

    Promise.all([
        fetch(`https://api.tvmaze.com/people/${actorId}`).then(response => response.json()),
        fetch(`https://api.tvmaze.com/people/${actorId}/castcredits?embed=show`).then(response => response.json()),
        fetch(`https://api.tvmaze.com/people/${actorId}/crewcredits?embed=show`).then(response => response.json())
    ])
        .then(([actor, castCredits, crewCredits]) => {
            actorDetailsFrame.srcdoc = renderActorDetails(actor, castCredits, crewCredits);
        });
}

/**
 * Closes the actor details modal by targeting the modal and its associated frame elements.
 *
 * @return {void} This method does not return a value.
 */
function closeActorDetails() {
    closeModal(
        document.querySelector('#actor-modal'),
        document.querySelector('#actor-details-frame')
    );
}