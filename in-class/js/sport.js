const url = 'https://content.guardianapis.com/search?q=sport&api-key=';
const apiKey = '6d4cccd4-4391-410d-9b51-0ca73162c0e9';
const resultList = document.querySelector('#results');

fetch(url + apiKey).then(response => response.json()).then((data) => {
    data.response.results.forEach(function (value) {
        const articleElement = `<div class="bg-white rounded shadow border-2 p-4 mb-4">
                                           <h5 class="text-lg font-semibold mb-2">${value.webTitle}</h5>
                                           <p class="text-gray-600 mb-3">${value.sectionName}</p>
                                           <a target="_blank" href="${value.webUrl}" class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">View Article</a>
                                       </div>`;
        resultList.insertAdjacentHTML('beforeend', articleElement);
    });
});