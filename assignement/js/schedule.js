const scheduleContainer = document.querySelector('#schedule-container');
const scheduleList = document.querySelector('#schedule');
const countryFilter = document.querySelector('#country-filter');
const dateFilter = document.querySelector('#date-filter');
const typeFilter = document.querySelector('#type-filter');

dateFilter.value = new Date().toISOString().split('T')[0];

function timeToMinutes(time) {
    if (!time || time === 'Unknown') {
        return null;
    }

    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');

    return `${hours}:${mins}`;
}

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

function loadSchedule(event) {
    event.preventDefault();

    const selectedCountry = countryFilter.value;
    const selectedDate = dateFilter.value;
    const selectedType = typeFilter.value;

    let scheduleUrl = 'https://api.tvmaze.com/schedule';

    const params = new URLSearchParams();

    if (selectedCountry !== '') {
        params.append('country', selectedCountry);
    }

    if (selectedDate !== '') {
        params.append('date', selectedDate);
    }

    const queryString = params.toString();

    if (queryString !== '') {
        scheduleUrl += `?${queryString}`;
    }

    scheduleContainer.classList.remove('hidden');
    scheduleList.innerHTML = '';

    fetch(scheduleUrl)
        .then(response => response.json())
        .then((episodes) => {
            const filteredEpisodes = episodes.filter(function (episode) {
                const show = episode.show;

                return selectedType === '' || show.type === selectedType;
            });

            if (filteredEpisodes.length === 0) {
                scheduleList.innerHTML = `<p class="text-center text-gray-600 dark:text-slate-300">No scheduled episodes found.</p>`;
                return;
            }

            const timedEpisodes = filteredEpisodes.filter(function (episode) {
                return timeToMinutes(episode.airtime) !== null;
            });

            if (timedEpisodes.length === 0) {
                scheduleList.innerHTML = `<p class="text-center text-gray-600 dark:text-slate-300">No timed episodes found.</p>`;
                return;
            }

            const slotSize = 30;

            const earliestTime = Math.floor(Math.min(...timedEpisodes.map(function (episode) {
                return timeToMinutes(episode.airtime);
            })) / slotSize) * slotSize;

            const latestTime = Math.ceil(Math.max(...timedEpisodes.map(function (episode) {
                const runtime = episode.runtime ?? episode.show.runtime ?? episode.show.averageRuntime ?? slotSize;

                return timeToMinutes(episode.airtime) + runtime;
            })) / slotSize) * slotSize;

            const timeSlots = [];

            for (let time = earliestTime; time <= latestTime; time += slotSize) {
                timeSlots.push(time);
            }

            const episodesByChannel = {};

            timedEpisodes.forEach(function (episode) {
                const show = episode.show;
                const channel = show.network?.name ?? show.webChannel?.name ?? 'Unknown channel';

                if (!episodesByChannel[channel]) {
                    episodesByChannel[channel] = [];
                }

                episodesByChannel[channel].push(episode);
            });

            const sortedChannels = Object.keys(episodesByChannel).sort();

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

                    const scheduleElement = `<a class="z-10 m-1 overflow-hidden rounded border border-gray-200 bg-white p-1.5 text-xs shadow hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 md:p-2 md:text-sm"
                                                href="${episode.url}"
                                                target="_blank"
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
                                            </a>`;

                    row.insertAdjacentHTML('beforeend', scheduleElement);
                });
            });
        });
}