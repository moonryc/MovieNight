const imdbApiKey = "k_bxw4k76r"

let favoriteMovies = [];

let autoFillMovies = []

let displayedMovies = []

let searchHistory = []

const favoritesButton = document.querySelector('#favorites-button')
let favoritesModal = document.querySelector('#favorites-modal')
const historyButton = document.querySelector('#history-button')
let historyModal = document.querySelector('#history-modal')




/**
 * Displays error text and removes error text after 10 seconds
 * @param errorMessage
 */
const errorHandler = (errorMessage) => {

    const errorEl = $("<div class='notification is-warning '>").text(errorMessage)

    $("#error-handler").append(errorEl)

    const deleteError = setInterval(() => {
        $(errorEl).remove()
        clearInterval(deleteError)
    }, 10 * 1000)

}

/**
 * Creates an array of 250 movies that are used for autofilling the search movie form
 */
const createAutoFillListOfMovies = function () {
    fetch(`https://imdb-api.com/en/API/Top250Movies/${imdbApiKey}`).then(response => {
        if (response.ok) {
            response.json().then(data => {
                for (let movie of data.items) {
                    autoFillMovies.push(movie.title)
                }
            })
        } else {
            errorHandler("Cannot get info from IMDB")
        }
    })
}

/**
 * fetches information on the movie submited creates the movie card if a card is found
 * @param movie
 */
const getMovieInformation = function (movie) {
    var apiUrl = 'https://www.omdbapi.com/?apikey=301ca359&t=' + movie + '&plot=full';
    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    if ("Error" in data) {
                        errorHandler("unable to find data for this movie")
                    } else {
                        displayMovieData(data);
                    }
                });
            } else {
                errorHandler("unable to find data for this movie")
            }
        });
};
/**
 * Creates a random movie from the array of 250 movies and displays the movie
 */
const getRandomMovie = () => {
    const index = Math.floor(Math.random() * autoFillMovies.length)
    if(displayedMovies.includes(autoFillMovies[index])){
        return getRandomMovie()
    }
    getMovieInformation(autoFillMovies[index])
}

const saveSearchedMovie = function (movieDetails) {
    if (searchHistory.length === 0) {
        searchHistory.push(movieDetails)
        localStorage.setItem('movieSearches', JSON.stringify(searchHistory))
    }
    else {
        for (var i = 0; i < searchHistory.length; i++) {
            if (movieDetails.movieTitle === searchHistory[i].movieTitle) {
                return
            }
            else {
                var movieNotSearchedYet = true
            }
        }
    }
    if (movieNotSearchedYet === true) {
        searchHistory.push(movieDetails)
        localStorage.setItem('movieSearches', JSON.stringify(searchHistory))
    }
};
/**
 * organizes the information retreived on a movie
 * @param movieInfo
 */
const displayMovieData = function (movieInfo) {

    const parseRatingData = (ratingArray) => {

        let ratings = {
            imdb: "N/A",
            rottenTomatoes: "N/A",
            metaCritic: "N/A",
        }

        for (let ratingSource of ratingArray) {
            switch (ratingSource.Source) {
                case "Internet Movie Database":
                    ratings.imdb = `${Math.trunc(eval(ratingSource.Value) * 100)}%`
                    break;
                case 'Rotten Tomatoes':
                    ratings.rottenTomatoes = ratingSource.Value
                    break;
                case 'Metacritic':
                    ratings.metaCritic = `${Math.trunc(eval(ratingSource.Value) * 100)}%`
                    break;
            }
        }
        return ratings
    }

    let movieDetails = {
        movieTitle: movieInfo.Title,
        moviePlot: movieInfo.Plot,
        moviePoster: movieInfo.Poster,
        rating: parseRatingData(movieInfo.Ratings),
        movieRuntime: movieInfo.Runtime,
        movieYear: movieInfo.Year,
        whereToView: ""
    }

    saveSearchedMovie(movieDetails)
    createMovieCard(movieDetails)

};


/**
 * Generates a Movie card based on the Movie Details Objects passed into it
 * @param movieDetails - and object composed on movieTitle, moviePlot, moviePoster, rating, movieRuntime, movieYear, whereToView
 */
const createMovieCard = (movieDetails) => {

    if (displayedMovies.includes(movieDetails.movieTitle)) {
        errorHandler("Movie is currently being displayed")
        return;
    } else {
        displayedMovies.push(movieDetails.movieTitle)
    }

    const isMovieFavorited = favoriteMovies.includes(movieDetails.movieTitle)

    //Create Column
    const column = $("<div class='column Movie-Card'>")
    const insideColumn = $("<div class='card-parent'>")
    insideColumn.appendTo(column)

    //Create Card
    const cardEl = $("<div class='card' style='width:500px'>")
    cardEl.appendTo(insideColumn)

    //Card Header
    const cardHeader = $("<div class='card-header'>")
    const cardHeaderTitle = $("<p class='card-header-title'>")
    cardHeaderTitle.text(movieDetails.movieTitle)
    cardHeaderTitle.appendTo(cardHeader)
    cardHeader.appendTo(cardEl)

    //Card Poster
    const cardPosterEl = $("<div class='card-image'>")
    const cardPosterFigureEl = $("<figure class='image is-4by3'>")
    const cardImageEl = $(`<img src=${movieDetails.moviePoster} alt="movie poster">`)
    cardImageEl.appendTo(cardPosterFigureEl)
    cardPosterFigureEl.appendTo(cardPosterEl)
    cardPosterEl.appendTo(cardEl)

    //Card ContentPreview
    const cardContentPreview = $("<div class='card-content'>")
    const cardContentPreviewContent = $("<div class='content columns'>")
    const cardContentPreviewIMDB = $("<div class='column'>").text(`IMDb: ${movieDetails.rating.imdb}`)
    const cardContentPreviewRottenTomatoes = $("<div class='column is-two-fifths'>").text(`Rotten Tomatoes: ${movieDetails.rating.rottenTomatoes}`)
    const cardContentPreviewMetaCritic = $("<div class='column'>").text(`MetaCritic: ${movieDetails.rating.metaCritic}`)
    cardContentPreviewIMDB.appendTo(cardContentPreviewContent)
    cardContentPreviewMetaCritic.appendTo(cardContentPreviewContent)
    cardContentPreviewRottenTomatoes.appendTo(cardContentPreviewContent)
    cardContentPreviewContent.appendTo(cardContentPreview)
    cardContentPreview.appendTo(cardEl)

    //Card Content Full Details
    const cardContentFull = $("<div class='card-content'>")
    const cardContentFullContent = $("<div class='content'>")
    cardContentFullContent.text(movieDetails.moviePlot)
    cardContentFullContent.appendTo(cardContentFull)
    cardContentFull.appendTo(cardEl)

    //Card Footer Actions
    const cardFooter = $("<footer class='card-footer'>")
    const favoriteButton = $("<i class='card-footer-item'>")
    const moreButton = $("<i class='fas fa-angle-down card-footer-item'>")
    const deleteButtonEl = $("<i class='card-footer-item fas fa-trash'>")
    favoriteButton.appendTo(cardFooter)
    moreButton.appendTo(cardFooter)
    deleteButtonEl.appendTo(cardFooter)
    cardFooter.appendTo(cardEl)


    //Sets favorite icon depending on if the movie is already favorite on creation
    if (isMovieFavorited) {
        $(favoriteButton).addClass("fas fa-heart")
    } else {
        $(favoriteButton).addClass("far fa-heart")
    }

    //Sets the card default to collapsed
    $(cardContentFull).toggle("down")

    //Handler for expanding the card and for changing the icons on click
    $(moreButton).click(function () {
        $(cardContentFull).toggle("down")
        const directionDown = $(moreButton).hasClass("fa-angle-down")
        if (directionDown) {
            moreButton.removeClass("fa-angle-down")
            moreButton.addClass("fa-angle-up")
        } else {
            moreButton.removeClass("fa-angle-up")
            moreButton.addClass("fa-angle-down")
        }
    })

    //Handler for favoriting the movie
    $(favoriteButton).click(function () {
        const notFavorited = $(favoriteButton).hasClass("far")
        if (notFavorited) {
            favoriteButton.removeClass("far")
            favoriteButton.addClass("fas")
        } else {
            favoriteButton.removeClass("fas")
            favoriteButton.addClass("far")
        }
        saveMovieHandler(movieDetails.movieTitle)
    })

    //Handler for deleting the card
    $(deleteButtonEl).click(function () {
        column.remove()
        let indexOfMovie = displayedMovies.indexOf(movieDetails.movieTitle)
        displayedMovies.splice(indexOfMovie, 1)
    })

    $("#Search-Cards").append(column)
}

/**
 * Handles saving and removing movies
 * @param movieTitle
 */
const saveMovieHandler = (movieTitle) => {
    //if movie is not in favorite
    if (!favoriteMovies.includes(movieTitle)) {
        favoriteMovies.push(movieTitle)
        localStorage.setItem('favorites', JSON.stringify(favoriteMovies))
    } else {
        const indexToRemove = favoriteMovies.indexOf(movieTitle)
        if (indexToRemove !== -1) {
            favoriteMovies.splice(indexToRemove, 1)
            localStorage.setItem('favorites', JSON.stringify(favoriteMovies))
        }
    }
}

/**
 * Loads local storage if it exists
 */
const loadMovieFavorites = () => {
    const retrieval = localStorage.getItem("favorites")

    if (retrieval === null) {
        favoriteMovies = []
    } else {
        favoriteMovies = JSON.parse(retrieval)
    }
}

const loadSearchHistory = function () {
    if (localStorage.getItem('movieSearches')) {
        searchHistory = JSON.parse(localStorage.getItem('movieSearches'))
    } else {
        searchHistory = []

    }
}

const displayFavorites = function () {

    favoritesModal.classList.add('is-active')
    let modalBackground = favoritesModal.querySelector('.modal-background')
    let modalDelete = favoritesModal.querySelector('.delete')
    let modalClose = favoritesModal.querySelector('#close-button')
    modalBackground.addEventListener('click', closeFavorites)
    modalDelete.addEventListener('click', closeFavorites)
    modalClose.addEventListener('click', closeFavorites)

    if (favoriteMovies.length === 0) {
        const favoritesModalEl = document.querySelector('#favorites-content')
        favoritesModalEl.textContent = 'You have not picked any favorite movies yet!'

    }
    else {
        const favoritesModalEl = document.querySelector('#favorites-content')
        while (favoritesModalEl.firstChild) {
            favoritesModalEl.removeChild(favoritesModalEl.firstChild);
        }

        for (var i = 0; i < favoriteMovies.length; i++) {

            let isMovie = function (movie) {
                return movie.movieTitle === favoriteMovies[i]
            }
            let favoriteMovieObj = searchHistory.find(isMovie)

            const favoriteMovieEl = document.createElement('div')
            favoriteMovieEl.classList = 'box'
            const favoriteMovieContainerEl = document.createElement('article')
            favoriteMovieContainerEl.classList = 'media'
            const favoriteMoviePosterEl = document.createElement('div')
            favoriteMoviePosterEl.classList = 'media-left'
            const favoriteMoviePosterContainerEl = document.createElement('figure')
            favoriteMoviePosterContainerEl.classList = 'image is-64x64'
            const favoriteMoviePosterImageEl = document.createElement('img')
            favoriteMoviePosterImageEl.src = favoriteMovieObj.moviePoster
            favoriteMoviePosterImageEl.alt = favoriteMovieObj.movieTitle + " Poster"
            const favoriteMovieInfoEl = document.createElement('div')
            favoriteMovieInfoEl.classList = 'media-content'
            const favoriteMovieTitleEl = document.createElement('p')
            favoriteMovieTitleEl.classList = 'card-header-title'
            favoriteMovieTitleEl.textContent = favoriteMovieObj.movieTitle
            const favoriteMovieDescriptionEl = document.createElement('div')
            favoriteMovieDescriptionEl.classList = 'content'
            favoriteMovieDescriptionEl.textContent = favoriteMovieObj.moviePlot
            const favoriteMovieHeartIconNavEl = document.createElement('nav')
            favoriteMovieHeartIconNavEl.classList = 'level'
            const favoriteMovieIconContainerEl = document.createElement('div')
            favoriteMovieIconContainerEl.classList = 'level-left'
            const favoriteMovieIconLinkEl = document.createElement('div')
            favoriteMovieIconLinkEl.classList = 'level-item'
            const favoriteMovieIconEl = document.createElement('span')
            favoriteMovieIconEl.classList = 'icon is-small'
            const favoriteMovieHeartEl = document.createElement('i')
            favoriteMovieHeartEl.classList = 'fas fa-heart'

            favoritesModalEl.appendChild(favoriteMovieEl)
            favoriteMovieEl.appendChild(favoriteMovieContainerEl)
            favoriteMovieContainerEl.appendChild(favoriteMoviePosterEl)
            favoriteMoviePosterEl.appendChild(favoriteMoviePosterContainerEl)
            favoriteMoviePosterContainerEl.appendChild(favoriteMoviePosterImageEl)
            favoriteMovieContainerEl.appendChild(favoriteMovieInfoEl)
            favoriteMovieInfoEl.appendChild(favoriteMovieTitleEl)
            favoriteMovieInfoEl.appendChild(favoriteMovieDescriptionEl)
            favoriteMovieInfoEl.appendChild(favoriteMovieHeartIconNavEl)
            favoriteMovieHeartIconNavEl.appendChild(favoriteMovieIconContainerEl)
            favoriteMovieIconContainerEl.appendChild(favoriteMovieIconLinkEl)
            favoriteMovieIconLinkEl.appendChild(favoriteMovieIconEl)
            favoriteMovieIconEl.appendChild(favoriteMovieHeartEl)

            favoriteMovieIconContainerEl.addEventListener('click', function () {
                favoriteMovieHeartEl.classList.remove("fas")
                favoriteMovieHeartEl.classList.add("far")
                saveMovieHandler(favoriteMovieObj.movieTitle)
                displayFavorites()
            })
        }
    }
}

const closeFavorites = function () {
    favoritesModal.classList.toggle('is-active')
}

const displayHistory = function () {
    loadSearchHistory()
    loadMovieFavorites()

    historyModal.classList.add('is-active')
    let modalBackground = historyModal.querySelector('.modal-background')
    let modalClose = historyModal.querySelector('#close-button')
    let modalDelete = historyModal.querySelector('.delete')
    modalBackground.addEventListener('click', closeHistory)
    modalClose.addEventListener('click', closeHistory)
    modalDelete.addEventListener('click', closeHistory)


    if (searchHistory.length === 0) {
        const historyModalEl = document.querySelector('#history-content')
        historyModalEl.textContent = 'You have not searched for any movies yet!'
    }
    else {
        const historyModalEl = document.querySelector('#history-content')
        while (historyModalEl.firstChild) {
            historyModalEl.removeChild(historyModalEl.firstChild);
        }

        for (var i = 0; i < searchHistory.length; i++) {

            const historyMovieEl = document.createElement('div')
            historyMovieEl.classList = 'box'
            const historyMovieContainerEl = document.createElement('article')
            historyMovieContainerEl.classList = 'media'
            const historyMoviePosterEl = document.createElement('div')
            historyMoviePosterEl.classList = 'media-left'
            const historyMoviePosterContainerEl = document.createElement('figure')
            historyMoviePosterContainerEl.classList = 'image is-64x64'
            const historyMoviePosterImageEl = document.createElement('img')
            historyMoviePosterImageEl.src = searchHistory[i].moviePoster
            historyMoviePosterImageEl.alt = searchHistory[i].movieTitle + " Poster"
            const historyMovieInfoEl = document.createElement('div')
            historyMovieInfoEl.classList = 'media-content'
            const historyMovieTitleEl = document.createElement('p')
            historyMovieTitleEl.classList = 'card-header-title'
            historyMovieTitleEl.textContent = searchHistory[i].movieTitle
            const historyMovieDescriptionEl = document.createElement('div')
            historyMovieDescriptionEl.classList = 'content'
            historyMovieDescriptionEl.textContent = searchHistory[i].moviePlot
            const historyMovieHeartIconNavEl = document.createElement('nav')
            historyMovieHeartIconNavEl.classList = 'level'
            const historyMovieIconContainerEl = document.createElement('div')
            historyMovieIconContainerEl.classList = 'level-left'
            const historyMovieIconLinkEl = document.createElement('div')
            historyMovieIconLinkEl.classList = 'level-item'
            const historyMovieIconEl = document.createElement('span')
            historyMovieIconEl.classList = 'icon is-small'
            const historyMovieHeartEl = document.createElement('i')

            if (favoriteMovies.indexOf(searchHistory[i].movieTitle) !== -1) {
                historyMovieHeartEl.classList = 'fas fa-heart'
            } else {
                historyMovieHeartEl.classList = 'far fa-heart'
            }

            historyModalEl.appendChild(historyMovieEl)
            historyMovieEl.appendChild(historyMovieContainerEl)
            historyMovieContainerEl.appendChild(historyMoviePosterEl)
            historyMoviePosterEl.appendChild(historyMoviePosterContainerEl)
            historyMoviePosterContainerEl.appendChild(historyMoviePosterImageEl)
            historyMovieContainerEl.appendChild(historyMovieInfoEl)
            historyMovieInfoEl.appendChild(historyMovieTitleEl)
            historyMovieInfoEl.appendChild(historyMovieDescriptionEl)
            historyMovieInfoEl.appendChild(historyMovieHeartIconNavEl)
            historyMovieHeartIconNavEl.appendChild(historyMovieIconContainerEl)
            historyMovieIconContainerEl.appendChild(historyMovieIconLinkEl)
            historyMovieIconLinkEl.appendChild(historyMovieIconEl)
            historyMovieIconEl.appendChild(historyMovieHeartEl)

            historyMovieIconContainerEl.addEventListener('click', function () {

                historyMovieHeartEl.classList.toggle("fas")
                historyMovieHeartEl.classList.toggle("far")
                let newClass = historyMovieHeartEl.getAttribute('class')
                let movieName = historyMovieTitleEl.textContent
                console.log(movieName)
                if (newClass === 'fa-heart fas') {
                    favoriteMovies.push(movieName)
                    localStorage.setItem('favorites', JSON.stringify(favoriteMovies))
                } else {
                    const indexToRemove = favoriteMovies.indexOf(movieName)
                    if (indexToRemove !== -1) {
                        favoriteMovies.splice(indexToRemove, 1)
                        localStorage.setItem('favorites', JSON.stringify(favoriteMovies))
                    }
                }
            })
        }
    }
}


/**
 * Submit movie handler
 */
$("#form").submit(function (event) {
    event.preventDefault();
    const input = $($(this)[0][0]).val().trim()
    getMovieInformation(input)
    $("#autocomplete").val("")
})

/**
 * Popular movie button handler
 */
$("#popular").click(() => {
    getRandomMovie()
})

/**
 * Handler for the autocomplete
 */
$("#autocomplete").autocomplete({
    source: (request, response) => {
        let results = $.ui.autocomplete.filter(autoFillMovies, $("#autocomplete").val());
        response(results.slice(0, 10))
    },
    open: function () {
        $("ul.ui-menu").width($(this).innerWidth())
    },
    minLength: 0,

})

// clear the entire page button 
$("#clear-entire-page").click(function () {
    $('#Search-Cards').empty();
    displayedMovies = [];
})

$(".burger").click(()=>{
    document.querySelector('.navbar-menu').classList.toggle('is-active'); document.querySelector('.navbar-burger').classList.toggle('is-active')
})

let closeHistory = function () {
    historyModal.classList.toggle('is-active')
}
/* "favorites" button handler */
favoritesButton.addEventListener('click', displayFavorites)
/* "history" button handler */
historyButton.addEventListener('click', displayHistory)


createAutoFillListOfMovies()

loadMovieFavorites()

loadSearchHistory()