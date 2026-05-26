const actorsContainer = document.querySelector('#actors-container');
const actorsList = document.querySelector('#actors');
const keywordsInput = document.querySelector('#keywords');

const genderFilter = document.querySelector('#gender-filter');
const countryFilter = document.querySelector('#country-filter');
const imageFilter = document.querySelector('#image-filter');
const birthdayFilter = document.querySelector('#birthday-filter');

function searchActors(event) {
    event.preventDefault();

    const keywords = keywordsInput.value.trim();
    const selectedGender = genderFilter.value;
    const selectedCountry = countryFilter.value;
    const selectedImageFilter = imageFilter.value;
    const selectedBirthdayFilter = birthdayFilter.value;

    if (keywords === '') {
        actorsContainer.classList.add('hidden');
        actorsList.innerHTML = '';
        return;
    }

    actorsContainer.classList.remove('hidden');
    actorsList.innerHTML = '';

    fetch(`https://api.tvmaze.com/search/people?q=${encodeURIComponent(keywords)}`)
        .then(response => response.json())
        .then((results) => {
            const filteredResults = results.filter(function (result) {
                const actor = result.person;

                const matchesGender = selectedGender === '' || actor.gender === selectedGender;
                const matchesCountry = selectedCountry === '' || actor.country?.name === selectedCountry;
                const matchesImage = selectedImageFilter === '' || actor.image?.medium;
                const matchesBirthday = selectedBirthdayFilter === ''
                    || (selectedBirthdayFilter === 'known' && actor.birthday)
                    || (selectedBirthdayFilter === 'unknown' && !actor.birthday);

                return matchesGender && matchesCountry && matchesImage && matchesBirthday;
            });

            if (filteredResults.length === 0) {
                actorsList.innerHTML = `<p class="col-span-full text-center text-gray-600 dark:text-slate-300">No actors found.</p>`;
                return;
            }

            filteredResults.forEach(function (result) {
                const actor = result.person;

                const actorElement = `<div class="container rounded-lg p-2 shadow-md">
                                        <img class="mb-2 w-full rounded-lg"
                                             src="${actor.image?.medium ?? 'https://dummyimage.com/210x295/cccccc/000000&text=No+Image'}"
                                             alt="${actor.name}">
                                        <h5 class="mb-2 text-lg font-semibold">${actor.name}</h5>
                                        <p class="mb-1 text-gray-600 dark:text-slate-300">Gender: ${actor.gender ?? 'Unknown'}</p>
                                        <p class="mb-1 text-gray-600 dark:text-slate-300">Country: ${actor.country?.name ?? 'Unknown'}</p>
                                        <p class="mb-3 text-gray-600 dark:text-slate-300">Birthday: ${actor.birthday ?? 'Unknown'}</p>
                                        <a class="inline-block rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
                                           href="${actor.url}"
                                           target="_blank">
                                            View Actor
                                        </a>
                                    </div>`;

                actorsList.insertAdjacentHTML('beforeend', actorElement);
            });
        });
}