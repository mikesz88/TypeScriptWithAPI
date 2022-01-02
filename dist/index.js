"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let movieList;
const section = document.getElementById('movie-grid');
const modalOpen = '[data-open]';
const modalClose = '[data-close]';
const isVisible = 'is-visible';
const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield fetch('https://mcuapi.herokuapp.com/api/v1/movies');
    const json = yield result.json();
    const cardData = json.data.map((movie) => ({
        id: movie.id,
        title: movie.title,
        releaseDate: movie.release_date,
        summary: movie.overview,
        img: movie.cover_url,
        phase: movie.phase,
        chronology: movie.chronology,
    }));
    movieList = cardData.filter((movie) => movie.id <= 27);
    paintDom(movieList);
});
const paintCard = (movie, div) => {
    div.innerHTML += `
    <div class="card-container" data-open="${movie.title}" data-type="${movie.phase}">
        <div class="card-img-container">    
            <img src="${movie.img}" alt="card image">
        </div>
        <h4>${movie.title}</h4>
        <p>Phase: ${movie.phase}</p>
        <div class="card-popup-box">
            <div>
            Click to find out more!
            </div>
        </div>
    </div>
    `;
};
const paintPage = (pageOfMovies, firstPage) => {
    const page = document.createElement('div');
    section.appendChild(page);
    if (firstPage) {
        page.className = 'card-flex-container active';
        for (const movie of pageOfMovies) {
            paintCard(movie, page);
        }
    }
    else {
        page.className = 'card-flex-container';
        for (const movie of pageOfMovies) {
            paintCard(movie, page);
        }
    }
};
const paintDom = (listOfChoice) => {
    let pageOfMovies = [];
    for (let index = 0; index < listOfChoice.length; index++) {
        const movie = listOfChoice[index];
        if (index === 0 || (index % 5 !== 0 && index !== listOfChoice.length - 1)) {
            pageOfMovies.push(movie);
        }
        else if (index % 5 === 0) {
            if (index === 5) {
                paintPage(pageOfMovies, 'active');
            }
            else {
                pageOfMovies.push(movie);
                paintPage(pageOfMovies);
            }
            pageOfMovies = [];
        }
        else if (index === listOfChoice.length - 1) {
            pageOfMovies.push(movie);
            paintPage(pageOfMovies);
        }
    }
};
const openModal = () => {
    const openModals = document.querySelectorAll(modalOpen);
    for (const ele of openModals) {
        ele.addEventListener('click', function () {
            const modalId = ele.dataset.open;
            if (modalId === 'favorites') {
                document.getElementById(modalId).classList.add(isVisible);
            }
        });
    }
};
fetchData();
openModal(); // I am here
//# sourceMappingURL=index.js.map