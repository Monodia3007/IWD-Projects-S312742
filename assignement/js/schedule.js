const scheduleContainer = document.querySelector('#schedule-container');
const scheduleList = document.querySelector('#schedule');
const countryFilter = document.querySelector('#country-filter');
const dateFilter = document.querySelector('#date-filter');
const typeFilter = document.querySelector('#type-filter');
const episodeModal = document.querySelector('#episode-modal');
const episodeDetailsFrame = document.querySelector('#episode-details-frame');

// Default the schedule date input to today's date.
dateFilter.value = new Date().toISOString().split('T')[0];

/**
 * Converts a time string in the format "HH:mm" to the total number of minutes.
 *
 * @param {string} time - A string representing time in "HH:mm" format. If the value is "Unknown" or not provided, the method returns null.
 * @return {number|null} The total number of minutes calculated from the given time, or null if the input is invalid.
 */
function timeToMinutes(time) {
    if (!time || time === 'Unknown') {
        return null;
    }

    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
}

/**
 * Converts a given number of minutes into a formatted time string in the "HH:MM" format.
 *
 * @param {number} minutes - The total number of minutes to convert.
 * @return {string} A formatted string representing the time in hours and minutes.
 */
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');

    return `${hours}:${mins}`;
}

/**
 * Transforms a given string value into a "safe" identifier by applying a series
 * of character replacements and formatting rules.
 *
 * @param {string} value - The input string to be transformed into a safe identifier.
 * @return {string} A "safe" identifier string, with special characters replaced or removed and spaces converted to hyphens.
 */
function getSafeId(value) {
    return value
        .toLowerCase()
        .replaceAll(' ', '-')
        .replaceAll('.', '')
        .replaceAll('&', 'and')
        .replaceAll('+', 'plus')
        .replaceAll("'", '')
        .replaceAll('/', '-');
}

/**
 * Loads and displays the TV schedule based on the selected filters.
 *
 * @param {Event} event The event triggered when interacting with the schedule loading mechanism, typically a form submission or button click.
 * @return {void} Does not return a value. Updates the DOM elements to display the schedule.
 */
function loadSchedule(event) {
    // Stop the form from refreshing the page.
    event.preventDefault();

    // Read the selected schedule filters.
    const selectedCountry = countryFilter.value;
    const selectedDate = dateFilter.value;
    const selectedType = typeFilter.value;

    let scheduleUrl = 'https://api.tvmaze.com/schedule';

    // URLSearchParams makes the API query string easier and safer to build.
    const params = new URLSearchParams();

    if (selectedCountry !== '') {
        params.append('country', selectedCountry);
    }

    if (selectedDate !== '') {
        params.append('date', selectedDate);
    }

    const queryString = params.toString();

    // Only add the question mark if there are actual query parameters.
    if (queryString !== '') {
        scheduleUrl += `?${queryString}`;
    }

    // Show the schedule container and clear any old schedule data.
    scheduleContainer.classList.remove('hidden');
    scheduleList.innerHTML = '';

    fetch(scheduleUrl)
        .then(response => response.json())
        .then((episodes) => {
            const filteredEpisodes = episodes.filter(function (episode) {
                const show = episode.show;

                // Filter by show type if the user selected one.
                return selectedType === '' || show.type === selectedType;
            });

            if (filteredEpisodes.length === 0) {
                scheduleList.innerHTML = `<p class="text-center text-gray-600 dark:text-slate-300">No scheduled episodes found.</p>`;
                return;
            }

            const timedEpisodes = filteredEpisodes.filter(function (episode) {
                // The timeline grid can only display episodes that have an airtime.
                return timeToMinutes(episode.airtime) !== null;
            });

            if (timedEpisodes.length === 0) {
                scheduleList.innerHTML = `<p class="text-center text-gray-600 dark:text-slate-300">No timed episodes found.</p>`;
                return;
            }

            // Each timeline slot represents 30 minutes.
            const slotSize = 30;

            // Find the earliest episode start time and round it down to the nearest slot.
            const earliestTime = Math.floor(Math.min(...timedEpisodes.map(function (episode) {
                return timeToMinutes(episode.airtime);
            })) / slotSize) * slotSize;

            // Find the latest episode end time and round it up to the nearest slot.
            const latestTime = Math.ceil(Math.max(...timedEpisodes.map(function (episode) {
                const runtime = episode.runtime ?? episode.show.runtime ?? episode.show.averageRuntime ?? slotSize;

                return timeToMinutes(episode.airtime) + runtime;
            })) / slotSize) * slotSize;

            const timeSlots = [];

            // Build each time column between the first and last scheduled episode.
            for (let time = earliestTime; time <= latestTime; time += slotSize) {
                timeSlots.push(time);
            }

            const episodesByChannel = {};

            timedEpisodes.forEach(function (episode) {
                const show = episode.show;

                // Shows can belong to a normal TV network or a web channel.
                const channel = show.network?.name ?? show.webChannel?.name ?? 'Unknown channel';

                // Create a new channel group if it does not already exist.
                if (!episodesByChannel[channel]) {
                    episodesByChannel[channel] = [];
                }

                // Store this episode under its channel.
                episodesByChannel[channel].push(episode);
            });

            // Sort channel names alphabetically for a cleaner schedule.
            const sortedChannels = Object.keys(episodesByChannel).sort();

            // Use smaller columns on mobile to keep the schedule usable.
            const channelColumnWidth = window.innerWidth < 768 ? 110 : 160;
            const timeColumnWidth = window.innerWidth < 768 ? 100 : 120;
            const timelineColumns = `${channelColumnWidth}px repeat(${timeSlots.length - 1}, ${timeColumnWidth}px)`;

            const scheduleGrid = `<div class="min-w-max rounded-lg border border-gray-300 text-xs dark:border-slate-600 md:text-sm">
                                        <div class="grid bg-indigo-600 font-semibold text-white"
                                             style="grid-template-columns: ${timelineColumns};">
                                            <div class="sticky left-0 z-40 border-r border-indigo-500 bg-indigo-600 p-2">
                                                Channel
                                            </div>
                                            <div class="grid"
                                                 style="grid-column: 2 / -1; grid-template-columns: repeat(${timeSlots.length - 1}, ${timeColumnWidth}px);"
                                                 id="schedule-header-times">
                                            </div>
                                        </div>

                                        <div id="schedule-rows"></div>
                                    </div>`;

            scheduleList.insertAdjacentHTML('beforeend', scheduleGrid);

            const scheduleHeaderTimes = document.querySelector('#schedule-header-times');
            const scheduleRows = document.querySelector('#schedule-rows');

            timeSlots.slice(0, -1).forEach(function (time) {
                const timeHeader = `<div class="border-r border-indigo-500 p-2 text-center">
                                        ${minutesToTime(time)}
                                    </div>`;

                scheduleHeaderTimes.insertAdjacentHTML('beforeend', timeHeader);
            });

            sortedChannels.forEach(function (channel) {
                const channelEpisodes = episodesByChannel[channel].sort(function (a, b) {
                    return timeToMinutes(a.airtime) - timeToMinutes(b.airtime);
                });

                const rowId = `row-${getSafeId(channel)}`;

                const channelRow = `<div class="grid min-h-20 border-t border-gray-300 dark:border-slate-600 md:min-h-24"
                                             style="grid-template-columns: ${timelineColumns};">
                                            <div class="sticky left-0 z-30 overflow-hidden border-r border-gray-300 bg-gray-200 p-2 text-xs font-semibold dark:border-slate-600 dark:bg-slate-800 md:text-sm">
                                                ${channel}
                                            </div>

                                            <div class="relative grid min-h-20 bg-gray-50 bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--time-column-width)-1px),rgb(148_163_184_/_0.15)_calc(var(--time-column-width)-1px),rgb(148_163_184_/_0.15)_var(--time-column-width))] dark:bg-slate-700 dark:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--time-column-width)-1px),rgb(148_163_184_/_0.12)_calc(var(--time-column-width)-1px),rgb(148_163_184_/_0.12)_var(--time-column-width))] md:min-h-24"
                                                 style="
                                                     --time-column-width: ${timeColumnWidth}px;
                                                     grid-column: 2 / -1;
                                                     grid-template-columns: repeat(${timeSlots.length - 1}, ${timeColumnWidth}px);
                                                 "
                                                 id="${rowId}">
                                            </div>
                                        </div>`;

                scheduleRows.insertAdjacentHTML('beforeend', channelRow);

                const row = document.querySelector(`#${rowId}`);

                channelEpisodes.forEach(function (episode) {
                    const show = episode.show;
                    const startMinutes = timeToMinutes(episode.airtime);
                    const runtime = episode.runtime ?? show.runtime ?? show.averageRuntime ?? slotSize;

                    const startColumn = Math.floor((startMinutes - earliestTime) / slotSize) + 1;
                    const spanColumns = Math.max(1, Math.ceil(runtime / slotSize));

                    const scheduleElement = `<button class="z-10 m-1 overflow-hidden rounded border border-gray-200 bg-white p-1.5 text-left text-xs shadow hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 md:p-2 md:text-sm"
                                onclick="openEpisodeDetails(${episode.id})"
                                type="button"
                                style="grid-column: ${startColumn} / span ${spanColumns}; grid-row: 1;">
                                <span class="block truncate font-semibold text-indigo-600 dark:text-indigo-400">
                                    ${show.name}
                                </span>
                                <span class="block truncate text-[11px] text-gray-600 dark:text-slate-300 md:text-xs">
                                    ${episode.airtime} - ${episode.name ?? 'Unknown episode'}
                                </span>
                                <span class="block truncate text-[11px] text-gray-500 dark:text-slate-400 md:text-xs">
                                    S${episode.season ?? '?'} E${episode.number ?? '?'} · ${runtime} min
                                </span>
                            </button>`;

                    row.insertAdjacentHTML('beforeend', scheduleElement);
                });
            });
        });
}

/**
 * Opens the episode details modal and fetches the data for a specific episode based on the given episode ID.
 * The method dynamically updates the content of an iframe with the episode details, including information about
 * the show, runtime, air date, and summary.
 *
 * @param {number|string} episodeId - The unique identifier of the episode to fetch and display details for.
 * @return {void} - This function does not return any value.
 */
function openEpisodeDetails(episodeId) {
    // Show the episode modal.
    episodeModal.classList.remove('hidden');
    episodeModal.classList.add('flex');

    // Display a loading page inside the iframe while the API request runs.
    episodeDetailsFrame.srcdoc = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"><\/script>
            <title>Loading episode details</title>
        </head>
        <body class="bg-gray-100 p-4 text-gray-800 dark:bg-slate-800 dark:text-slate-200 sm:p-6">
            <div class="flex min-h-screen items-center justify-center">
                <p class="rounded-xl bg-gray-100 p-4 text-center text-base shadow-md dark:bg-slate-700 sm:text-lg">
                    Loading episode details...
                </p>
            </div>
        </body>
        </html>
    `;

    fetch(`https://api.tvmaze.com/episodes/${episodeId}?embed=show`)
        .then(response => response.json())
        .then((episode) => {
            // The "?embed=show" API option includes the parent show in the response.
            const show = episode._embedded?.show;

            // Prefer the episode runtime, then show runtime, then average runtime.
            const runtime = episode.runtime ?? show?.runtime ?? show?.averageRuntime ?? 'Unknown';

            // Replace the loading iframe page with the final episode details page.
            episodeDetailsFrame.srcdoc = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script src="https://cdn.tailwindcss.com"><\/script>
                    <title>${episode.name ?? 'Episode details'}</title>
                </head>
                <body class="bg-gray-100 p-3 text-gray-800 dark:bg-slate-800 dark:text-slate-200 sm:p-5 md:p-6">
                    <main class="mx-auto max-w-6xl">
                        <section class="mb-4 rounded-xl bg-gray-100 p-3 shadow-md dark:bg-slate-700 sm:p-5 md:mb-6">
                            <div class="grid gap-4 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
                                <img class="mx-auto w-full max-w-sm rounded-lg shadow-md md:w-full"
                                     src="${episode.image?.medium ?? show?.image?.medium ?? 'https://dummyimage.com/295x166/cccccc/000000&text=No+Image'}"
                                     alt="${episode.name ?? 'Episode image'}">

                                <div>
                                    <p class="mb-2 text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 md:text-left">
                                        ${show?.name ?? 'Unknown show'}
                                    </p>

                                    <h1 class="mb-3 text-center text-2xl font-bold text-gray-800 dark:text-slate-100 sm:text-3xl md:text-left">
                                        ${episode.name ?? 'Unknown episode'}
                                    </h1>

                                    <div class="mb-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                            <strong>Season:</strong> ${episode.season ?? 'Unknown'}
                                        </p>
                                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                            <strong>Episode:</strong> ${episode.number ?? 'Unknown'}
                                        </p>
                                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                            <strong>Air date:</strong> ${episode.airdate || 'Unknown'}
                                        </p>
                                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                            <strong>Air time:</strong> ${episode.airtime || 'Unknown'}
                                        </p>
                                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                            <strong>Runtime:</strong> ${runtime === 'Unknown' ? runtime : `${runtime} minutes`}
                                        </p>
                                        <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                            <strong>Type:</strong> ${show?.type ?? 'Unknown'}
                                        </p>
                                    </div>

                                    <div class="text-sm leading-relaxed text-gray-700 dark:text-slate-300 sm:text-base">
                                        ${episode.summary ?? '<p>No episode summary available.</p>'}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="rounded-xl bg-gray-100 p-3 shadow-md dark:bg-slate-700 sm:p-5">
                            <h2 class="mb-3 text-xl font-semibold text-gray-800 dark:text-slate-100 sm:text-2xl">
                                Show Information
                            </h2>

                            <div class="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                    <strong>Show:</strong> ${show?.name ?? 'Unknown'}
                                </p>
                                <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                    <strong>Status:</strong> ${show?.status ?? 'Unknown'}
                                </p>
                                <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                    <strong>Language:</strong> ${show?.language ?? 'Unknown'}
                                </p>
                                <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                    <strong>Rating:</strong> ${show?.rating?.average ?? 'N/A'}
                                </p>
                                <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                    <strong>Network:</strong> ${show?.network?.name ?? show?.webChannel?.name ?? 'Unknown'}
                                </p>
                                <p class="rounded bg-gray-200 px-3 py-2 dark:bg-slate-800">
                                    <strong>Genres:</strong> ${show?.genres?.length ? show.genres.join(', ') : 'Unknown'}
                                </p>
                            </div>
                        </section>
                    </main>
                </body>
                </html>
            `;
        });
}

/**
 * Closes the episode details modal by hiding it and clearing its content.
 * Adjusts the display properties of the modal and resets the source of the details frame.
 *
 * @return {void} This method does not return a value.
 */
function closeEpisodeDetails() {
    episodeModal.classList.add('hidden');
    episodeModal.classList.remove('flex');
    episodeDetailsFrame.srcdoc = '';
}