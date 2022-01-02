let movieList: MovieData[];
const section = document.getElementById('movie-grid')! as HTMLElement;
const modalOpen = '[data-open]';
const modalClose = '[data-close]';
const isVisible = 'is-visible';


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
}

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

const paintPage = (pageOfMovies: MovieData[], firstPage?: string) => {
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

const paintDom = (listOfChoice: MovieData[]) => {
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

const openModal = () => {
    const openModals: NodeListOf<HTMLElement> = document.querySelectorAll(modalOpen);
    for (const ele of openModals) {
        ele.addEventListener('click', function() {
            const modalId = ele.dataset.open;
            if (modalId === 'favorites') {
                document.getElementById(modalId)!.classList.add(isVisible);
            }
        })
    }
}

fetchData();
openModal(); // I am here