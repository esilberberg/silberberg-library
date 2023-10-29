const api = 'https://api.zotero.org/groups/5247575'

async function getData(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      const totalResults = data.meta.numItems - 4;
      console.log(totalResults);
      return data;
    } catch (error) {
      window.alert(error.message);
    }
  }

getData(api);