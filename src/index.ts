const root = document.documentElement;
const body = root.querySelector('body')! as HTMLBodyElement;
let movieList: MovieData[] = [];
let favMovieList: MovieData[] = [];
const section = document.getElementById('movie-grid')! as HTMLElement;
const modalOpen = '[data-open]';
const modalClose = '[data-close]';
const isVisible = 'is-visible';
let openModals: NodeListOf<HTMLElement> = document.querySelectorAll(modalOpen);
let navButton = document.querySelectorAll('button[aria-expanded]');
const favSection = document.getElementById('favorites')! as HTMLElement;
let favSectionFlexBox = document.createElement('div')! as HTMLDivElement;
favSectionFlexBox.classList.add('fav-flex-container', 'container');
const dataList = '[data-list]';
let dataListLinks = document.querySelectorAll(dataList);

let slides: NodeListOf<HTMLElement> = document.querySelectorAll('.card-flex-container');
let buttons = document.querySelectorAll('.slide-control-container button');

let current = 0;
let next = current < slides.length - 1 ? current + 1 : 0;
let prev = current > 0 ? current - 1 : slides.length - 1;
const active = 'active';



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
        chronology: movie.chronology === null ? movie.id : movie.chronology,
    }))
    movieList = cardData.filter((movie: MovieData) => movie.id <= 27 );
    paintDom(movieList);
    openModals = document.querySelectorAll(modalOpen);
    activateOpenModals();
    movieCount();
    slides = document.querySelectorAll('.card-flex-container');
    next = current < slides.length - 1 ? current + 1 : 0;
    prev = current > 0 ? current - 1 : slides.length - 1;
    update();
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
    openModals = document.querySelectorAll(modalOpen);
    slides = document.querySelectorAll('.card-flex-container');
    buttons = document.querySelectorAll('.slide-control-container button');
}

const paintPage = (pageOfMovies: MovieData[], firstPage?: string):void => {
    const page = document.createElement('div');
    section.appendChild(page)
    if (firstPage) {
        page.className = `card-flex-container ${firstPage}`;
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

// favButton function
const favButtonCheck = () => {
    const buttonFav = document.getElementsByClassName('pop-btn');
    for (const ele of buttonFav) {
        ele.addEventListener('click', function() {
            addCard(ele);
        });
    }
}

const removePopup = (ele: Element) => {
    const chosenPopUpCardHTML = document.getElementById(ele.id)!;
    chosenPopUpCardHTML.classList.remove('is-visible');

}

const updateMovieLists = () => {
    const containers = document.querySelectorAll('.card-flex-container')!;
    for (const element of containers) {
        element.remove();
    }
    const oldFavContainer = document.querySelector('.fav-flex-container')!;
    oldFavContainer.remove();
    const favContainer = document.createElement('div');
    favContainer.classList.add('fav-flex-container', 'container');

    paintDom(movieList);
    for (const card of favMovieList) {
        paintCard(card, favContainer)
    }
    console.log(favContainer);
    
    favSection.appendChild(favContainer);
    openModals = document.querySelectorAll(modalOpen);
    activateOpenModals();
    slides = document.querySelectorAll('.card-flex-container');
    buttons = document.querySelectorAll('.slide-control-container button');
}

const addCard = (ele: Element) => {
    removePopup(ele);

    const originalIndex = movieList.findIndex((movie: MovieData) => movie.title === ele.id);
    const favIndex = favMovieList.findIndex((movie: MovieData) => movie.title === ele.id);
    if (originalIndex >= 0) {
        favMovieList.push(movieList[originalIndex]);
        movieList.splice(originalIndex,1);
        setActive(document.querySelector('[data-list="original"]')!,'.sorted')

    } else if (favIndex >= 0) {
        movieList.push(favMovieList[favIndex]);
        favMovieList.splice(favIndex,1);
        setActive(document.querySelector('[data-list="fav-original"]')!,'.sorted')
    }

    updateMovieLists();
}

const activateOpenModals = ():void => {    
    for (const ele of openModals) {                
        ele.addEventListener('click', function() {                            
            const modalId: string | undefined = ele.dataset.open;
            const modalChosen: MovieData[] | undefined = movieList.filter((movie: MovieData) => movie.title === modalId );        
            if (modalId === 'favorites') {
                document.getElementById(modalId)!.classList.add(isVisible);
            } else {                            
                popUpCard(modalChosen[0]);
                setTimeout(function() {
                    document.getElementById(modalChosen[0].title)!.classList.add(isVisible);
                }, 100)
                favButtonCheck();
            }
            closeModalCheck();
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

// setActive
const setActive = (elm: Element, selector: string) => {
    if (document.querySelector(`${selector}.${active}`) !== null) {
        document.querySelector(`${selector}.${active}`)!.classList.remove(active);
    };
    elm.classList.add(active);
}

//favorites navBar 
const favNavBar = () => {
    favSection.innerHTML = `
    <nav class="container navbar">
        <div class="img-container">
            <img class="thanos" src="assets/thanos-g8d7032f3c_640.png" alt="">
        </div>
        <h1 class="header-lg">Marvel Cinema Movies</h1>
        <div class="img-container">
            <img class="tony" src="assets/iron-man-g2b444ff67_640.png" alt="">
        </div>
    </nav>

    <div class="option-container container">
        <button class="favorites-link btn btn-primary" aria-expanded="false" aria-controls="favDropdown">
            Favorite Options
        </button>
        <button class="navbar-toggler btn btn-primary" data-close="favorites">
            Back to Movies
        </button>
        <ul id="fav-page" class="ul-defaults-none header-sm">
            <li data-list="fav-original" class="sorted btn btn-alt">Original</li>
            <li data-list="fav-chronological" class="sorted btn btn-alt">Chronological</li>
            <li data-list="fav-alpha" class="sorted btn btn-alt">A-Z</li>
            <li data-list="fav-reverseAlpha" class="sorted btn btn-alt">Z-A</li>
        </ul>
    </div>
    `;
    favSection.appendChild(favSectionFlexBox);
    dataListLinks = document.querySelectorAll(dataList);
    navButton = document.querySelectorAll('button[aria-expanded]');
}

favNavBar();


// black screen click escape
document.addEventListener('click', e => {
    if (e.target === document.querySelector('.modal.is-visible')) {
        const module: Element = document.querySelector('.modal.is-visible')!;
        module.classList.remove(isVisible);
        setTimeout(function() {
            module.remove();
        },400);
    }
})

// ESCAPE KEY
document.addEventListener('keyup', e => {
    if (e.key === 'Escape') {
        const module: Element = document.querySelector('.modal.is-visible')!;
        module.classList.remove(isVisible);
        setTimeout(function() {
            module.remove();
        },400);        
    }
})

// slide carousel
for (let i: number = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', () => i === 0 ? goToPrev() : goToNext())
}

const goToNum = (number: number) => {
    current = number;
    next = current < slides.length - 1 ? current + 1 : 0;
    prev = current > 0 ? current - 1 : slides.length - 1;
    update();
}

const update = () => {
    slides.forEach(slide => {
        slide.classList.remove('active', 'previous', 'next');
    })
    slides[prev].classList.add('previous');
    slides[current].classList.add('active');
    slides[next].classList.add('next');
}

const goToNext = () => current < slides.length - 1 ? goToNum(current + 1) : goToNum(0);
const goToPrev = () => current > 0 ? goToNum(current - 1) : goToNum(slides.length - 1);

const toggleNav = ({target}: any) => {       
    const expanded: boolean = target.getAttribute('aria-expanded') === 'true' || false;
    for (const button of navButton) {
        if (button === target) {
            button.setAttribute('aria-expanded', `${!expanded}`);
        }  
    }
}

// sort function
const sortMovies = (list: MovieData[], sort: 'alpha' | 'reverse' | 'chronological' | 'original') => {
    if (sort === 'alpha') {
        list = list.sort((a:MovieData, b:MovieData) => {
            if(a.title < b.title) { return -1; }
            if(a.title > b.title) { return 1; }
            return 0;
        })
        return list;
    } else if (sort === 'reverse') {
        list = list.sort((a:MovieData, b:MovieData) => {
            if(a.title > b.title) { return -1; }
            if(a.title < b.title) { return 1; }
            return 0;
        })
        return list;
    } else if (sort === 'chronological') {
        list = list.sort((a:MovieData, b:MovieData) => a.chronology - b.chronology)
        return list;
    } else if (sort === 'original') {
        list = list.sort((a:MovieData, b:MovieData) => a.id - b.id)
        return list;
    }
    return list;
}

// Options Toggle
for (const button of navButton) {
    button.addEventListener('click', toggleNav);
}

// show sorted cards per category
for (const link of dataListLinks) {
    link.addEventListener('click', function(this:HTMLElement) {
        setActive(link, '.sorted');
        const list = this.dataset.list!;
        const oldFavContainer = document.querySelector('.fav-flex-container')! as HTMLDivElement;
        const favContainer = document.createElement('div');
        if (list.includes('fav')) {
            oldFavContainer.remove();
            favContainer.classList.add('fav-flex-container container');
        } else {
            const containers = document.querySelectorAll('.card-flex-container');
            for (const element of containers) {
                element.remove();
            }
        }
        switch (list) {
            case 'fav-original':
                const favOriginal: MovieData[] = sortMovies(favMovieList, 'original')
                for (const card of favOriginal) {
                    paintCard(card, favContainer)
                }
            case 'fav-chronological':
                const favChronological: MovieData[] = sortMovies(favMovieList, 'chronological')
                for (const card of favChronological) {
                    paintCard(card, favContainer)
                }
            break;
            case 'fav-alpha':
                const favAlpha: MovieData[] = sortMovies(favMovieList, 'alpha')
                for (const card of favAlpha) {
                    paintCard(card, favContainer)
                }
            break;
            case 'fav-reverseAlpha':
                const favReverse: MovieData[] = sortMovies(favMovieList, 'reverse')
                for (const card of favReverse) {
                    paintCard(card, favContainer)
                }
            break;
            case 'original':
                const original: MovieData[] = sortMovies(movieList, 'original')
                paintDom(original);            
                break;

            case 'chronological':
                const originalChronological: MovieData[] = sortMovies(movieList, 'chronological');
                paintDom(originalChronological);            break;
            case 'alpha':
                const originalAlpha: MovieData[] = sortMovies(movieList, 'alpha');
                paintDom(originalAlpha);
            break;
            case 'reverseAlpha':
                const reverseOriginalAlpha: MovieData[] = sortMovies(movieList, 'reverse');
                paintDom(reverseOriginalAlpha);
            break;
        }
    })
}