const api1 = 'https://api.zotero.org/groups/5247575'
const api2 = 'https://api.zotero.org/groups/5247575/items?limit=20&sort=title';

async function getData1(url) {
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

getData1(api1);

authors = [];

async function getData2(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    data[13].data.creators.forEach(creator => {
      let name = creator.firstName + ' ' + creator.lastName
      authors.push(name)
    });
    console.log(data[13].data.creators);
    console.log('authors:', authors);
    return data;
  } catch (error) {
    window.alert(error.message);
  }
}

getData2(api2);
