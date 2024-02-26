import { useDeleteSavedPost, useGetCurrentuser, useLikePost, useSavePost } from "@/lib/react-query/queriesAndMutations"
import { checkIsLiked } from "@/lib/utils"
import { Models } from "appwrite"
import React, { useEffect, useState } from "react"
import Loader from "./Loader"

type PostStatsProps = {
    post?: Models.Document;
    userId: string;
  };

const PostStats = ({post, userId}: PostStatsProps) => {

    const likesList = post?.likes?.map((user: Models.Document) => user.$id) || [];
    const [likes, setLikes] = useState<string[]>(likesList);
    const [isSaved, setIsSaved] = useState(false)


    const {mutate: likePost} = useLikePost()
    const {mutate: savePost, isPending: isSavingPost} = useSavePost()
    const {mutate: deleteSavedPost, isPending: isDeletingSaved} = useDeleteSavedPost()

    const { data: currentUser} = useGetCurrentuser()

    const savedPostRecord = currentUser?.save.find((record: Models.Document) => record.post.$id === post?.$id)

    useEffect(() => {
      setIsSaved(!!savedPostRecord)
    }, [currentUser])


    const handleLikePost =(e: React.MouseEvent) => {
        e.stopPropagation();

        let newLikes = [...likes]

        const hasLiked = newLikes.includes(userId)

        if(hasLiked){
          newLikes = newLikes.filter((id) => id !== userId)
        } else {
          newLikes.push(userId)
        }
        setLikes(newLikes)
        likePost({postId: post?.$id || '', likesArray: newLikes})
    }

 const handleSavePost =(e: React.MouseEvent) => {
        e.stopPropagation();

        if(savedPostRecord){
          setIsSaved(false)
          deleteSavedPost(savedPostRecord.$id)
        } else {
          
         savePost({postId: post?.$id || '', userId})
         setIsSaved(true)
        }
    }

  return (
    <div className="flex justify-between items-center z-20">
        <div className="flex gap-2 mr-5">
       <img
          src={
            checkIsLiked(likes, userId)
              ? "/assets/liked.svg"
              : "/assets/like.svg"
          }
          alt="like"
          width={20}
          height={20}
          onClick={(e) => handleLikePost(e)}
          className="cursor-pointer"
        />
            <p className="small-medium lg:base-medium">{likes.length}</p>
        </div>
        <div className="flex gap-2">
        {isSavingPost || isDeletingSaved ? <Loader /> : <img
          src={isSaved ? "/assets/saved.svg" : "/assets/save.svg"}
          alt="share"
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={(e) => handleSavePost(e)}
        />}
        </div>
    </div>
  )
}

export default PostStats