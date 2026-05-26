const showsContainer = document.querySelector('#shows-container');
const showsList = document.querySelector('#shows');
const keywordsInput = document.querySelector('#keywords');
const genreFilter = document.querySelector('#genre-filter');
const statusFilter = document.querySelector('#status-filter');
const ratingFilter = document.querySelector('#rating-filter');
const languageFilter = document.querySelector('#language-filter');

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
                                        <a class="inline-block rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
                                           href="${show.url}"
                                           target="_blank">
                                            View Show
                                        </a>
                                    </div>`;

                showsList.insertAdjacentHTML('beforeend', showElement);
            });
        });
}