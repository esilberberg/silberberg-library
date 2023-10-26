const apiEndpoint = 'https://api.zotero.org/groups/5247575/items?sort=title';
const display = document.getElementById('display-library');
const input = document.getElementById('search-bar');
const refreshBtn = document.getElementById('refresh-btn');
const searchBtn = document.getElementById('search-btn');
const searchSummary = document.getElementById('search-summary');
const formatSelector = document.getElementById('format-selector');

function removeDiacritics(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

refreshBtn.addEventListener('click', () => {
  input.value = '';
  formatSelector.selectedIndex = 0;
  runSearch();
});

let zoteroData = [];

async function getData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    zoteroData = data;
    filterData(input.value);
  } catch (error) {
    window.alert(error.message);
  }
}

getData(apiEndpoint);

function filterData(query, format) {
  if (format === 1) {
    formatFilterData = zoteroData.filter((item) => item.data.itemType === 'book');
  } else if (format === 2) {
    formatFilterData = zoteroData.filter((item) => item.data.itemType === 'audioRecording');
  } else {
    formatFilterData = zoteroData;
  }

  if (query) {
    const searchTerms = query.toLowerCase().split(/\s+/).map(term => removeDiacritics(term));

    const filteredData = formatFilterData.filter(allData => {
      return searchTerms.every(term => {
        return (
          Object.values(allData.data).some(value => {
            if (value && typeof value === 'string') {
              return removeDiacritics(value.toLowerCase()).includes(term);
            }
            return false;
          }) |
          (allData.data.creators &&
            allData.data.creators.length > 0 &&
            allData.data.creators[0].firstName &&
            removeDiacritics(allData.data.creators[0].firstName.toLowerCase()).includes(term)) ||
          (allData.data.creators &&
            allData.data.creators.length > 0 &&
            allData.data.creators[0].lastName &&
            removeDiacritics(allData.data.creators[0].lastName.toLowerCase()).includes(term)) ||
          (allData.data.tags &&
            allData.data.tags.some(tagObject =>
              removeDiacritics(tagObject.tag.toLowerCase()).includes(term)
            ))
        );
      });
    });

    displayData(filteredData, query);
  } else {
    displayData(formatFilterData, format);
  }
}

function runSearch() {
  const searchTerms = input.value.trim();
  const selectedFormat = formatSelector.selectedIndex;
  filterData(searchTerms, selectedFormat);
}
searchBtn.addEventListener('click', runSearch);
input.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    runSearch();
  }
});

function displayData(data, queryTerms) {
  if (queryTerms === 1) {
    queryTerms = 'all books';
  } else if (queryTerms === 2) {
    queryTerms = 'all recordings';
  } else {
    queryTerms;
  }

  if (data.length === 1) {
    searchSummaryMsg = `A search for ${queryTerms} returned ${data.length} result.`
  } else if (data.length < zoteroData.length) {
    searchSummaryMsg = `A search for ${queryTerms} returned ${data.length} results.`
  } else {
    searchSummaryMsg = `Showing all ${data.length} results.`
  }

  searchSummary.innerHTML = searchSummaryMsg;

  let dataDisplay = data.map((object) => {
    let itemTypeLabel = object.data.itemType === 'book' ? 'Book' : (object.data.itemType === 'audioRecording' ? 'Recording' : object.data.itemType);

    const tags = object.data.tags.map(tagObject => tagObject.tag).join(', ');
    return `
    <div class="item-wrapper">
      <div class="item-type-label">${itemTypeLabel}</div>
      <div class="title">${object.data.title}</div>
      <div class="second-line"><button class="author-name">${object.data.creators[0].firstName} ${object.data.creators[0].lastName}</button> | ${object.data.date}</div>
      <div>Subjects: ${tags.split(', ').map(tag => `<button class="subject-tag">${tag}</button>`).join(', ')}</div>
      <div>Location: ${object.data.archive}</div>
    </div>
    `;
  }).join('');

  display.innerHTML = dataDisplay;

  // Add event listeners to all subject tags.
  document.querySelectorAll('.subject-tag').forEach(tagLink => {
    tagLink.addEventListener('click', () => {
      subjectLinkGenerator(event, tagLink);
    });
  });

  // Add event listeners to all author links.
  document.querySelectorAll('.author-name').forEach(authorLink => {
    authorLink.addEventListener('click', () => {
      subjectLinkGenerator(event, authorLink);
    });
  });
}

function subjectLinkGenerator(event, link) {
  filterData(link.textContent);
}
