const showsContainer = document.querySelector('#shows-container');
const showsList = document.querySelector('#shows');
const keywordsInput = document.querySelector('#keywords');
const genreFilter = document.querySelector('#genre-filter');
const statusFilter = document.querySelector('#status-filter');
const ratingFilter = document.querySelector('#rating-filter');
const languageFilter = document.querySelector('#language-filter');

/**
 * Handles the search logic for TV shows based on user-specified filters and keywords.
 *
 * @param {Event} event - The event object associated with the form submission.
 * @return {void} This method does not return a value.
 */
function searchShows(event) {
    // Stop the form from refreshing the page.
    event.preventDefault();

    // Read the current search/filter values from the form.
    const keywords = keywordsInput.value.trim();
    const selectedGenre = genreFilter.value;
    const selectedStatus = statusFilter.value;
    const selectedRating = Number(ratingFilter.value);
    const selectedLanguage = languageFilter.value;

    // If the search box is empty, hide the results area and clear old results.
    if (keywords === '') {
        showsContainer.classList.add('hidden');
        showsList.innerHTML = '';
        return;
    }

    // Show the results container and clear any previous search results.
    showsContainer.classList.remove('hidden');
    showsList.innerHTML = '';

    // Search TVMaze using the user's keyword.
    fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(keywords)}`)
        .then(response => response.json())
        .then((results) => {
            const filteredResults = results.filter(function (result) {
                const show = result.show;

                // TVMaze sometimes returns null ratings, so use 0 for filtering.
                const showRating = show.rating.average ?? 0;

                // Each filter passes if no option is selected, or if the show matches the selected option.
                const matchesGenre = selectedGenre === '' || show.genres.includes(selectedGenre);
                const matchesStatus = selectedStatus === '' || show.status === selectedStatus;
                const matchesRating = selectedRating === 0 || showRating >= selectedRating;
                const matchesLanguage = selectedLanguage === '' || show.language === selectedLanguage;

                // Only keep shows that match every selected filter.
                return matchesGenre && matchesStatus && matchesRating && matchesLanguage;
            });

            // Show a friendly message if nothing matches the search and filters.
            if (filteredResults.length === 0) {
                showsList.innerHTML = `<p class="col-span-full text-center text-gray-600 dark:text-slate-300">No shows found.</p>`;
                return;
            }

            filteredResults.forEach(function (result) {
                const show = result.show;

                // createShowCard() comes from details.js and includes the "View Show" modal button.
                showsList.insertAdjacentHTML('beforeend', createShowCard(show));
            });
        });
}