export async function searchWikiTitles(setLoading, name) {
  if (!name) {
    return;
  }
  setLoading(true);
  const url =
    "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      format: "json",
      list: "search",
      srsearch: name,
      srlimit: "100",
      utf8: 1,
      origin: "*",
      formatversion: "2",
    }).toString();
  try {
    var result = await fetch(url).then((response) => {
      return response.json();
    });
  } catch (error) {
    console.log(error);
    return false;
  }

  return result.query.search.map((n) => {
    return n.title;
  });
}

export async function fetchWikiTitles(e, name) {
  let continueFetch = true;
  let newArticles = [name];
  let urlParams = {
    action: "query",
    format: "json",
    prop: "links",
    continue: "",
    titles: name,
    plnamespace: "0",
    pllimit: "max",
    origin: "*",
    formatversion: "2",
  };
  while (continueFetch) {
    const url =
      "https://en.wikipedia.org/w/api.php?" +
      new URLSearchParams(urlParams).toString();

    try {
      var result = await fetch(url).then((response) => {
        return response.json();
      });
    } catch (error) {
      console.log(error);
      return false;
    }

    continueFetch = false;
    //Wikipedia api is limited to 500 result per response. A continue parameter is provided
    //to continue if more than 500 results are available.
    if (result.continue) {
      continueFetch = true;
      urlParams.plcontinue = result.continue.plcontinue;
    }
    //Wikipedia api returns a missing key if the title does not exist.
    if (result.query.pages[0].missing === true) {
      return false;
    }
    newArticles = [
      ...newArticles,
      ...result.query.pages[0].links.map((n) => n.title),
    ];
  }

  return newArticles;
}

export async function fetchWikiImages(a, name) {
  let arrayOfImages = [];
  //Wikipedia api provides 50 images max per request.
  var size = 40;
  var arrayOfArrays = [];
  for (var i = 0; i < a.length; i += size) {
    arrayOfArrays.push(a.slice(i, i + size));
  }

  for (var y = 0; y < arrayOfArrays.length; y++) {
    const url =
      "https://en.wikipedia.org/w/api.php?" +
      new URLSearchParams({
        action: "query",
        format: "json",
        prop: "pageimages",
        piprop: "thumbnail",
        titles: arrayOfArrays[y].join("|"),
        pithumbsize: "500",
        origin: "*",
        formatversion: "2",
        pilicense: "any",
      }).toString();
    try {
      var result = await fetch(url).then((response) => {
        return response.json();
      });
    } catch (error) {
      console.log(error);
      return false;
    }

    arrayOfImages.push(...result.query.pages);
  }
  arrayOfImages = arrayOfImages.map((n) => {
    return n.thumbnail
      ? [n.title, n.thumbnail.source, n.thumbnail.height, n.thumbnail.width]
      : [n.title, null, null, null];
  });
  //Place the main title image at at the begging of the array.
  let indexOfTitle = arrayOfImages.findIndex((element) => element[0] === name);
  let arrayOfTitle = arrayOfImages.splice(indexOfTitle, 1);
  arrayOfImages.unshift(...arrayOfTitle);

  return arrayOfImages;
}

export function isVisible(viewBox, image) {
  //Function to determine which pictures are visible in the current user viewbox
  //to avoid rendering all the images.
  let [x1, x2, y1, y2] = [
    viewBox[0],
    viewBox[0] + viewBox[2],
    viewBox[1],
    viewBox[1] + viewBox[3],
  ];
  let [Ix1, Ix2, Iy1, Iy2] = [image.x, image.x + 80, image.y, image.y + 80];
  return x1 <= Ix2 && Ix1 <= x2 && y1 <= Iy2 && Iy1 <= y2;
}

export function searchArticles(str, articles) {
  //return first 20 results matching the search term
  let resultArray = [];
  if (!str) {
    return resultArray;
  }
  const regex = new RegExp(`${str}`, "i");
  for (let i = 0; i < articles.length; i++) {
    for (let k = 0; k < articles[i].length; k++) {
      if (articles[i][k].title.match(regex)) {
        if (resultArray.length === 20) {
          return resultArray;
        }
        resultArray.push([
          articles[i][k].title,
          articles[i][k].x,
          articles[i][k].y,
        ]);
      }
    }
  }

  return resultArray;
}
