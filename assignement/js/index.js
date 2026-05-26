const showsUrl = 'https://api.tvmaze.com/shows';
const peopleUrl = 'https://api.tvmaze.com/people';

const showsList = document.querySelector('#shows');
const actorsList = document.querySelector('#actors');

fetch(showsUrl)
    .then(response => response.json())
    .then((shows) => {
        const topShows = shows
            .sort((a, b) => {
                return (b.rating.average ?? 0) - (a.rating.average ?? 0);
            })
            .slice(0, 10);

        topShows.forEach(function (show) {
            const showElement = `<div class="container rounded-lg p-2 shadow-md">
                                    <img class="mb-2 w-full rounded-lg"
                                         src="${show.image?.medium ?? 'https://dummyimage.com/210x295/cccccc/000000&text=No+Image'}"
                                         alt="${show.name}">
                                    <h5 class="mb-2 text-lg font-semibold">${show.name}</h5>
                                    <p class="mb-3 text-gray-600 dark:text-slate-300">Rating: ${show.rating.average ?? 'N/A'}</p>
                                    <a class="inline-block rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
                                       href="${show.url}"
                                       target="_blank">
                                        View Show
                                    </a>
                                </div>`;

            showsList.insertAdjacentHTML('beforeend', showElement);
        });
    });

fetch(peopleUrl)
    .then(response => response.json())
    .then((actors) => {
        const randomActors = actors
            .filter((actor) => {
                return actor.image?.medium;
            })
            .sort(() => {
                return Math.random() - 0.5;
            })
            .slice(0, 10);

        randomActors.forEach(function (actor) {
            const actorElement = `<div class="container rounded-lg p-2 shadow-md">
                                    <img class="mb-2 w-full rounded-lg"
                                         src="${actor.image.medium}"
                                         alt="${actor.name}">
                                    <h5 class="mb-2 text-lg font-semibold">${actor.name}</h5>
                                    <p class="mb-3 text-gray-600 dark:text-slate-300">Country: ${actor.country?.name ?? 'Unknown'}</p>
                                    <a class="inline-block rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
                                       href="${actor.url}"
                                       target="_blank">
                                        View Actor
                                    </a>
                                </div>`;

            actorsList.insertAdjacentHTML('beforeend', actorElement);
        });
    });