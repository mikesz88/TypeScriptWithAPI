const root = document.documentElement;
const body = root.querySelector('body')! as HTMLBodyElement;
let movieList: MovieData[] = [];
const section = document.getElementById('movie-grid')! as HTMLElement;
const modalOpen = '[data-open]';
const modalClose = '[data-close]';
const isVisible = 'is-visible';
let openModals: NodeListOf<HTMLElement> = document.querySelectorAll(modalOpen);


interface APIFilteredData {
    id: number;
    title: string;
    release_date: string;
    overview: string | null;
    cover_url: string;
    phase: number;
    chronology: number
}

interface MovieData {
    id: number;
    title: string;
    releaseDate: string;
    summary: string | null;
    img: string;
    phase: number;
    chronology: number
}

const fetchData = async () => {
    const result = await fetch('https://mcuapi.herokuapp.com/api/v1/movies');
    const json = await result.json();
    const cardData = json.data.map((movie: APIFilteredData) => ({
        id: movie.id,
        title: movie.title,
        releaseDate: movie.release_date,
        summary: movie.overview,
        img: movie.cover_url,
        phase: movie.phase,
        chronology: movie.chronology,
    }))
    movieList = cardData.filter((movie: MovieData) => movie.id <= 27 );
    paintDom(movieList);
    openModals = document.querySelectorAll(modalOpen);
    activateOpenModals();
    movieCount();
}
fetchData();


const paintCard = (movie: MovieData, div: HTMLDivElement) => {
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
}

const paintPage = (pageOfMovies: MovieData[], firstPage?: string):void => {
    const page = document.createElement('div');
    section.appendChild(page)
    if (firstPage) {
        page.className = 'card-flex-container active';
        for (const movie of pageOfMovies) {
            paintCard(movie, page);
        }
    } else {
        page.className = 'card-flex-container';
        for (const movie of pageOfMovies) {
            paintCard(movie, page);
        }
        
    }
}

const paintDom = (listOfChoice: MovieData[]):void => {
    let pageOfMovies: MovieData[] = [];
    for (let index = 0; index < listOfChoice.length; index++) {
        const movie = listOfChoice[index]        
        if (index === 0 || (index % 5 !== 0 && index !== listOfChoice.length - 1)) {
            pageOfMovies.push(movie);
        } else if (index % 5 === 0) {
            if (index === 5) {
                paintPage(pageOfMovies, 'active')
            } else {
                pageOfMovies.push(movie);
                paintPage(pageOfMovies);
            }
            pageOfMovies = [];
        } else if (index === listOfChoice.length - 1) { 
            pageOfMovies.push(movie);
            paintPage(pageOfMovies)
        }  
    }
}

//MovieCount
const movieCount = ():void => {
    const phaseOne: number = movieList.filter((movie: MovieData) => movie.phase === 1).length;
    const phaseTwo: number = movieList.filter((movie: MovieData) => movie.phase === 2).length;
    const phaseThree: number = movieList.filter((movie: MovieData) => movie.phase === 3).length;
    const phaseFour: number = movieList.filter((movie: MovieData) => movie.phase === 4).length;    
    const section = document.querySelector('.movie-count')!;
    const div = document.createElement('div');
    div.innerHTML = `
    <h3 class="header-md">MCU Movie Phase Counts</h3>
    <div class="count-flex-box">
    <div class="header-sm">Phase One: ${phaseOne}</div>
    <div class="header-sm">Phase Two: ${phaseTwo}</div>
    <div class="header-sm">Phase Three: ${phaseThree}</div>
    <div class="header-sm">Phase Four: ${phaseFour}</div>
    </div>
    `;
    section.appendChild(div);
}

// popup card html
const popUpCard = (movie: MovieData):void => {
    const div = document.createElement('div');
    div.setAttribute('data-animation', 'slideInOutTop');
    div.setAttribute('id', movie.title);
    div.className = 'modal';
    div.innerHTML = `
    <div class="modal-dialog">
        <header class="modal-header">
            <h3>${movie.title}</h3>
            <i class="fas fa-times" data-close></i>
        </header>

        <div class="modal-body">
            <div class="img-wrapper">
                <img src="${movie.img}"></img>
            </div>
            <div class="text-wrapper">
                <div class="basic-card-info">
                    <p>Type: ${movie.id}</p>
                    <p>Level: ${movie.phase}</p>
                    <p>Attack: ${movie.chronology}</p>
                    <p>Defense: ${movie.releaseDate}</p>
                </div>
                <div class="card-desc">
                    ${movie.summary}
                </div>
            </div>
            <button id="${movie.title}" class="btn btn-primary pop-btn">Add to Favorites</button>
        </div>

    </div>
    `;
    body.appendChild(div);
}

const activateOpenModals = ():void => {
    for (const ele of openModals) {        
        ele.addEventListener('click', function() {                
            const modalId: string | undefined = ele.dataset.open;
            const modalChosen: MovieData[] | undefined = movieList.filter((movie: MovieData) => movie.title === modalId );        
            if (modalId === 'favorites') {
                document.getElementById(modalId)!.classList.add(isVisible);
                closeModalCheck();
            } else {            
                console.log(modalChosen[0]);
                popUpCard(modalChosen[0]);
                setTimeout(function() {
                    document.getElementById(modalChosen[0].title)!.classList.add(isVisible);
                }, 100)
                closeModalCheck();
            }
        })
    }
}

const closeModalCheck = ():void => {
    const closeModal:NodeListOf<HTMLElement> = document.querySelectorAll(modalClose);
    for (const elm of closeModal) {
        elm.addEventListener('click', function() {
            const modalId = this.dataset.close;
            if (modalId === 'favorites') {
                document.getElementById(modalId)!.classList.remove(isVisible);
            } else {
                this.parentElement!.parentElement!.parentElement!.classList.remove(isVisible);
                setTimeout(function() {
                    elm.parentElement!.parentElement!.parentElement!.remove();
                },400);
            }
        })
    }
}

// black screen click escape
document.addEventListener('click', e => {
    if (e.target === document.querySelector('.modal.is-visible')) {
        const module = document.querySelector('.modal.is-visible')!;
        module.classList.remove(isVisible);
        setTimeout(function() {
            module.remove();
        },400);
    }
})

// ESCAPE KEY
document.addEventListener('keyup', e => {
    if (e.key === 'Escape') {
        const module = document.querySelector('.modal.is-visible')!;
        module.classList.remove(isVisible);
        setTimeout(function() {
            module.remove();
        },400);        
    }
})