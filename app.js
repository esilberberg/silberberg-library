const apiEndpoint = 'https://script.google.com/macros/s/AKfycbxIZm7Nd_UYOjeJy_v9IImjJY7maBs0U36OZYZyOvLWdw6srfVCLDRkw_kBsyHqAVrozQ/exec';
const display = document.getElementById('library-display');
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

let apiData = [];

async function getData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    apiData = data;
    filterData(input.value);
  } catch (error) {
    window.alert(error.message);
  }
}

getData(apiEndpoint);

function filterData(query, format) {
  if (format === 1) {
    formatFilterData = apiData.filter((item) => item.Item_Type === 'book');
  } else if (format === 2) {
    formatFilterData = apiData.filter((item) => item.Item_Type === 'audioRecording');
  } else {
    formatFilterData = apiData;
  }

  if (query) {
    const searchTerms = query.toLowerCase().split(/\s+/).map(term => removeDiacritics(term));

    const filteredData = formatFilterData.filter(allData => {
      return searchTerms.every(term => {
        return (
          Object.values(allData).some(value => {
            if (value && typeof value === 'string') {
              return removeDiacritics(value.toLowerCase()).includes(term);
            }
            return false;
          })
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
  
  data.sort((a, b) => a.Title.localeCompare(b.Title));

  if (queryTerms === 1) {
    queryTerms = 'all books';
  } else if (queryTerms === 2) {
    queryTerms = 'all recordings';
  } else {
    queryTerms;
  }

  if (data.length === 1) {
    searchSummaryMsg = `A search for ${queryTerms} returned ${data.length} result.`
  } else if (data.length < apiData.length) {
    searchSummaryMsg = `A search for ${queryTerms} returned ${data.length} results.`
  } else {
    searchSummaryMsg = `Showing all ${data.length} results.`
  }

  searchSummary.innerHTML = searchSummaryMsg;

  let dataDisplay = data.map((object) => {
    let itemTypeLabel = object.Item_Type === 'book' ? '<i class="fa-solid fa-book"></i>' : (object.Item_Type === 'audioRecording' ? '<i class="fa-solid fa-record-vinyl"></i>' : object.Item_Type);

    const arrayOfSubjects = object.Subject.split(';');
    const arrayOfLanguages = object.Language.split(';');
    const arrayOfAuthors = object.Author.split(';');

    return `
    <div class="item-row-accordion">
      <div class="item-row-left">
          <div class="item-type-label">${itemTypeLabel}</div>
          <div class="title">${object.Title}</div>
      </div>
    </div>
    <div class="item-row-hidden-panel">
      <div class="item-row-panel-content">
          <div class="author">${arrayOfAuthors.map(author => `<button class="author-name">${author}</button>`).join('<br>')}</div>
          <div class="year">${object.Year}</div>
          <div class="publisher">Publisher: ${object.Publisher}</div>
          <div class="language">Language: ${arrayOfLanguages.map(lang => `<button class="language-tag">${lang}</button>`).join(', ')}</div>
          <div class="subjects">Subjects: ${arrayOfSubjects.map(subject => `<button class="subject-tag">${subject}</button>`).join(', ')}</div>
          <div class="location">Location: ${object.Location}</div>
      </div>
    </div>
    `;
  }).join('');

  display.innerHTML = dataDisplay;

  // Add event listeners to all subject tags.
  document.querySelectorAll('.subject-tag').forEach(subjectLink => {
    subjectLink.addEventListener('click', () => {
      subjectLinkGenerator(event, subjectLink);
    });
  });

  document.querySelectorAll('.language-tag').forEach(langLink => {
    langLink.addEventListener('click', () => {
      subjectLinkGenerator(event, langLink);
      console.log(langLink);
    });
  });

  // Add event listeners to all author links.
  document.querySelectorAll('.author-name').forEach(authorLink => {
    authorLink.addEventListener('click', () => {
      subjectLinkGenerator(event, authorLink);
    });
  });
  // Create the accordion elements.
  const itemAccordion = document.querySelectorAll('.item-row-accordion');

  // Add event listeners to the accordion elements.
  for (let i = 0; i < itemAccordion.length; i++) {
    itemAccordion[i].addEventListener("click", function() {
      this.classList.toggle("active-item-row-accordion");
      var panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });

}};

function subjectLinkGenerator(event, link) {
  filterData(link.textContent);
}
