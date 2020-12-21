const { default: axios } = require('axios');
import BookInstance from '../models/book_instance';
import Inquiry from '../models/inquiry';


const FETCH_BOOK_QUERY = `
query bookInstances($lat: Float, $lng: Float, $term: String, $offerings: [String] ) {
  bookInstances(lat: $lat, lng: $lng, term: $term, offerings: $offerings) {
    id
    medium
    reader {
      id
      name
      photos
    }
    book {
      id
      title
      tags
      authors {
        name
        id
        bio
      }
      small_cover_url
      medium_cover_url
    }
    location
  }
}
`
const POST_BOOK_QUERY = `
mutation PostBook($lat: Float!, $lng: Float!, $bookId: ID!, $medium: Medium!, $offerings: [Offering]) {
  postBook(bookId: $bookId, lat: $lat, lng: $lng, medium: $medium, offerings: $offerings) {
    id
    reader{
      id
      name
    }
    book {
      id
      title
      isbn
      authors{
        id
        name
        bio
      }
    }
  } 
}
`


export const submitOffering = (token: string | null, bookId: string, lat: number, lng: number, offerings: Array<string>, medium: string): Promise<BookInstance> => {
  return new Promise((resolve, rejected) =>
      axios({
        url: "/api/graph",
        method: "post",
        data: {
          query: POST_BOOK_QUERY,
          variables: {bookId, lat, lng, offerings, medium},
          headers: { 'Authorization': `Bearer ${token}`} }
        })
      .then( response => {
        return resolve(response.data.data.bookInstances)
      })
      .catch( error => {
        return rejected(error)
      })
    )
}


export default class BookInstanceService {
  constructor() {
    this.fetchBooks = this.fetchBooks.bind(this)
  }

  public fetchBooks(token: string, term: string | null, lat: number, lng: number, offerings: Array<string> | null): Promise<Array<BookInstance>>{
    return new Promise((resolve, rejected) =>

      axios({
        url: "/api/graph",
        method: "post",
        data: {
          query: FETCH_BOOK_QUERY,
          variables: {term, lat, lng, offerings },
          headers: { 'Authorization': `Bearer ${token}`} }
        })
      .then( response => {
        return resolve(response.data.data.bookInstances)
      })
      .catch( error => {
        return rejected(error)
      })
    )
  }

  public inquiry(token: string | null, bookInstanceId: string, type: string): Promise<Inquiry> {
    return new Promise((resolve, rejected) =>
      axios.post("/api/inquiries", {book_instance_id: bookInstanceId, type}, { headers: { 'Authorization': `Bearer ${token}`}})
        .then( response => {
          return resolve(response.data)
        })
        .catch( error => {
          return rejected(error)
        })
    )
  }  
}
