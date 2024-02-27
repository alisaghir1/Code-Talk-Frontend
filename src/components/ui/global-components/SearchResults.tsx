import { Models } from "appwrite";
import Loader from "./Loader";
import GridPostList from "./GridPostList";


type SearchResultsProps ={
  isSearching: boolean;
  searchPosts: Models.Document[]
}

const SearchResults = ({isSearching, searchPosts}: SearchResultsProps) => {
  if(isSearching) return <Loader />

  if(searchPosts && searchPosts.documents.length > 0) return (
    <GridPostList posts={searchPosts.documents} />
  )
  return (
    <p className="text-light-4 mt-10 text-center w-full">
      No results found
    </p>
  )
}

export default SearchResults