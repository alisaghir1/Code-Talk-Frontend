import GridPostList from "@/components/ui/global-components/GridPostList"
import Loader from "@/components/ui/global-components/Loader"
import SearchResults from "@/components/ui/global-components/SearchResults"
import { Input } from "@/components/ui/input"
import useDebounce from "@/hooks/useDebounce"
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queriesAndMutations"
import { useState,useEffect } from "react"
import { useInView } from "react-intersection-observer"


const Explore = () => {
  const{ ref, inView } = useInView()
  const{ data: posts, fetchNextPage, hasNextPage} = useGetPosts()

  const [searchValue, setSearchValue] = useState('')

  //used for not draining the search and the api for every letter to type so we have like a litte delay
  const debouncedValue = useDebounce(searchValue, 500)
  const { data: searchPosts, isFetching: isSearching} = useSearchPosts(debouncedValue)

  useEffect(() => {
    if(inView && !searchValue) fetchNextPage()
  }, [inView, searchValue])
  
  if(!posts){
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    )
  }

  const shouldShowSearchResults = searchValue !== ''
  const shouldShowPosts = !shouldShowSearchResults && posts.pages.every(
    (item) => item?.documents.length === 0)

  return (
    <div className='explore-container'>
      <div className='explore-inner_container'>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img src="/assets/search.svg" 
               alt="search"
               width={24}
               height={24}
           />
           <Input type="text" 
           placeholder="Search for posts"
           className="explore-search"
           value={searchValue}
           onChange={(e) => setSearchValue(e.target.value)}
           />
        </div>
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
      <h3 className='body-bold md:h3-bold'>
          Discover what other Developers think!
        </h3>

      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults && searchPosts ? (
          <SearchResults
          isSearching={isSearching}
          searchPosts={searchPosts}
          />
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        ) : (
          posts.pages.map((item, index) => (
            item && item.documents ? (
            <GridPostList key={`page-${index}`} posts={item.documents} />
            ) : null
          ))
        )}
      </div>
      {hasNextPage && !searchValue && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
    </div>
  )
}

export default Explore