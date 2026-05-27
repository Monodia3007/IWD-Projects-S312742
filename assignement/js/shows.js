const showsContainer = document.querySelector('#shows-container');
const showsList = document.querySelector('#shows');
const keywordsInput = document.querySelector('#keywords');
const genreFilter = document.querySelector('#genre-filter');
const statusFilter = document.querySelector('#status-filter');
const ratingFilter = document.querySelector('#rating-filter');
const languageFilter = document.querySelector('#language-filter');
const showModal = document.querySelector('#show-modal');
const showDetailsFrame = document.querySelector('#show-details-frame');

function searchShows(event) {
    event.preventDefault();

    const keywords = keywordsInput.value.trim();
    const selectedGenre = genreFilter.value;
    const selectedStatus = statusFilter.value;
    const selectedRating = Number(ratingFilter.value);
    const selectedLanguage = languageFilter.value;

    if (keywords === '') {
        showsContainer.classList.add('hidden');
        showsList.innerHTML = '';
        return;
    }

    showsContainer.classList.remove('hidden');
    showsList.innerHTML = '';

    fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(keywords)}`)
        .then(response => response.json())
        .then((results) => {
            const filteredResults = results.filter(function (result) {
                const show = result.show;
                const showRating = show.rating.average ?? 0;

                const matchesGenre = selectedGenre === '' || show.genres.includes(selectedGenre);
                const matchesStatus = selectedStatus === '' || show.status === selectedStatus;
                const matchesRating = selectedRating === 0 || showRating >= selectedRating;
                const matchesLanguage = selectedLanguage === '' || show.language === selectedLanguage;

                return matchesGenre && matchesStatus && matchesRating && matchesLanguage;
            });

            if (filteredResults.length === 0) {
                showsList.innerHTML = `<p class="col-span-full text-center text-gray-600 dark:text-slate-300">No shows found.</p>`;
                return;
            }

            filteredResults.forEach(function (result) {
                const show = result.show;

                const showElement = `<div class="container rounded-lg p-2 shadow-md">
                                        <img class="mb-2 w-full rounded-lg"
                                             src="${show.image?.medium ?? 'https://dummyimage.com/210x295/cccccc/000000&text=No+Image'}"
                                             alt="${show.name}">
                                        <h5 class="mb-2 text-lg font-semibold">${show.name}</h5>
                                        <p class="mb-1 text-gray-600 dark:text-slate-300">Rating: ${show.rating.average ?? 'N/A'}</p>
                                        <p class="mb-1 text-gray-600 dark:text-slate-300">Status: ${show.status}</p>
                                        <p class="mb-3 text-gray-600 dark:text-slate-300">Language: ${show.language ?? 'Unknown'}</p>
                                        <button class="inline-block rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
                                                onclick="openShowDetails(${show.id})"
                                                type="button">
                                            View Show
                                        </button>
                                    </div>`;

                showsList.insertAdjacentHTML('beforeend', showElement);
            });
        });
}

function openShowDetails(showId) {
    showModal.classList.remove('hidden');
    showModal.classList.add('flex');

    showDetailsFrame.srcdoc = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"><\/script>
            <title>Loading show details</title>
        </head>
        <body class="bg-gray-100 p-4 text-gray-800 dark:bg-slate-800 dark:text-slate-200 sm:p-6">
            <div class="flex min-h-screen items-center justify-center">
                <p class="rounded-xl bg-gray-100 p-4 text-center text-base shadow-md dark:bg-slate-700 sm:text-lg">
                    Loading show details...
                </p>
            </div>
        </body>
        </html>
    `;

    Promise.all([
        fetch(`https://api.tvmaze.com/shows/${showId}`).then(response => response.json()),
        fetch(`https://api.tvmaze.com/shows/${showId}/seasons`).then(response => response.json()),
        fetch(`https://api.tvmaze.com/shows/${showId}/episodes`).then(response => response.json())
    ])
        .then(([show, seasons, episodes]) => {
            const seasonsHtml = seasons.map((season) => {
                return `<li class="rounded border border-gray-200 p-3">
                            <strong>Season ${season.number}</strong>
                            <br>
                            Episodes: ${season.episodeOrder ?? 'Unknown'}
                            <br>
                            Premiere: ${season.premiereDate ?? 'Unknown'}
                            <br>
                            End: ${season.endDate ?? 'Unknown'}
                        </li>`;
            }).join('');

            const episodesHtml = episodes.map((episode) => {
                return `<li class="rounded border border-gray-200 p-3">
                            <strong>S${episode.season} E${episode.number}: ${episode.name}</strong>
                            <br>
                            Air date: ${episode.airdate || 'Unknown'}
                            <br>
                            Runtime: ${episode.runtime ? `${episode.runtime} minutes` : 'Unknown'}
                        </li>`;
            }).join('');

            showDetailsFrame.srcdoc = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script src="https://cdn.tailwindcss.com"><\/script>
                    <title>${show.name}</title>
                </head>
                <body class="bg-gray-100 p-3 text-gray-800 dark:bg-slate-800 dark:text-slate-200 sm:p-5 md:p-6">
                    <main class="mx-auto max-w-6xl">
                        <section class="mb-4 rounded-xl bg-gray-100 p-3 shadow-md dark:bg-slate-700 sm:p-5 md:mb-6">
                            <div class="grid gap-4 md:grid-cols-[180px_1fr] lg:grid-cols-[220px_1fr]">
                                <img class="mx-auto w-40 rounded-lg shadow-md sm:w-48 md:w-full"
                                     src="${show.image?.medium ?? 'https://dummyimage.com/210x295/cccccc/000000&text=No+Image'}"
                                     alt="${show.name}">

                                <div>
                                    <h1 class="mb-3 text-center text-2xl font-bold text-gray-800 dark:text-slate-100 sm:text-3xl md:text-left">${show.name}</h1>

                                    <div class="mb-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                            <strong>Rating:</strong> ${show.rating.average ?? 'N/A'}
                                        </p>
                                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                            <strong>Status:</strong> ${show.status}
                                        </p>
                                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                            <strong>Language:</strong> ${show.language ?? 'Unknown'}
                                        </p>
                                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                            <strong>Premiered:</strong> ${show.premiered ?? 'Unknown'}
                                        </p>
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
                    </main>
                </body>
                </html>
            `;
        });
}

function closeShowDetails() {
    showModal.classList.add('hidden');
    showModal.classList.remove('flex');
    showDetailsFrame.srcdoc = '';
}