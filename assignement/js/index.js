const showsUrl = 'https://api.tvmaze.com/shows';
const peopleUrl = 'https://api.tvmaze.com/people';

// Containers where the home page cards will be inserted.
const showsList = document.querySelector('#shows');
const actorsList = document.querySelector('#actors');

// Load all shows from TVMaze for the home page "Top Shows" section.
fetch(showsUrl)
    .then(response => response.json())
    .then((shows) => {
        const topShows = shows
            // Sort shows by highest average rating first.
            .sort((a, b) => {
                return (b.rating.average ?? 0) - (a.rating.average ?? 0);
            })
            // Only show the top 10 results on the home page.
            .slice(0, 10);

        topShows.forEach(function (show) {
            // createShowCard() is stored in details.js so it can be reused on multiple pages.
            showsList.insertAdjacentHTML('beforeend', createShowCard(show));
        });
    });

// Load people from TVMaze for the home page "Actors" section.
fetch(peopleUrl)
    .then(response => response.json())
    .then((actors) => {
        const randomActors = actors
            // Only show actors with images, so the cards look complete.
            .filter((actor) => {
                return actor.image?.medium;
            })
            // Randomise the actor order.
            .sort(() => {
                return Math.random() - 0.5;
            })
            // Limit the home page to 10 actor cards.
            .slice(0, 10);

        randomActors.forEach(function (actor) {
            // createActorCard() is stored in details.js so the same card style is reused.
            actorsList.insertAdjacentHTML('beforeend', createActorCard(actor));
        });
    });