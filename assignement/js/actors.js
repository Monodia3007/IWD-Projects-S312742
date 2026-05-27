const actorsContainer = document.querySelector('#actors-container');
const actorsList = document.querySelector('#actors');
const keywordsInput = document.querySelector('#keywords');

const genderFilter = document.querySelector('#gender-filter');
const countryFilter = document.querySelector('#country-filter');
const imageFilter = document.querySelector('#image-filter');
const birthdayFilter = document.querySelector('#birthday-filter');

/**
 * Searches for actors based on the specified filters and displays the results.
 *
 * @param {Event} event - The event object representing the form submission or related event. Prevents default behaviour to handle submission.
 * @return {void} - This method does not return any value. The results are dynamically rendered on the UI.
 */
function searchActors(event) {
    // Stop the form from refreshing the page.
    event.preventDefault();

    // Read the current search/filter values from the form.
    const keywords = keywordsInput.value.trim();
    const selectedGender = genderFilter.value;
    const selectedCountry = countryFilter.value;
    const selectedImageFilter = imageFilter.value;
    const selectedBirthdayFilter = birthdayFilter.value;

    // If the search box is empty, hide the result area and remove old results.
    if (keywords === '') {
        actorsContainer.classList.add('hidden');
        actorsList.innerHTML = '';
        return;
    }

    // Show the result area and clear previous results before displaying new ones.
    actorsContainer.classList.remove('hidden');
    actorsList.innerHTML = '';

    // Search TVMaze people using the user's keyword.
    fetch(`https://api.tvmaze.com/search/people?q=${encodeURIComponent(keywords)}`)
        .then(response => response.json())
        .then((results) => {
            const filteredResults = results.filter(function (result) {
                const actor = result.person;

                // Each filter passes if no option is selected or if the actor matches the selected option.
                const matchesGender = selectedGender === '' || actor.gender === selectedGender;
                const matchesCountry = selectedCountry === '' || actor.country?.name === selectedCountry;
                const matchesImage = selectedImageFilter === '' || actor.image?.medium;
                const matchesBirthday = selectedBirthdayFilter === ''
                    || (selectedBirthdayFilter === 'known' && actor.birthday)
                    || (selectedBirthdayFilter === 'unknown' && !actor.birthday);

                // Only keep actors that match every selected filter.
                return matchesGender && matchesCountry && matchesImage && matchesBirthday;
            });

            // Show a friendly message if no actor matches the search/filter settings.
            if (filteredResults.length === 0) {
                actorsList.innerHTML = `<p class="col-span-full text-center text-gray-600 dark:text-slate-300">No actors found.</p>`;
                return;
            }

            filteredResults.forEach(function (result) {
                const actor = result.person;

                // createActorCard() comes from details.js and includes the "View Actor" modal button.
                // The second argument shows extra details on the actor search page.
                actorsList.insertAdjacentHTML('beforeend', createActorCard(actor, true));
            });
        });
}