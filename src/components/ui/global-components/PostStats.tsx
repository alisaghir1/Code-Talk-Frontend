import {
  useAddComment,
  useDeleteSavedPost,
  useGetCurrentuser,
  useLikePost,
  useSavePost,
} from "@/lib/react-query/queriesAndMutations";
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite";
import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import { INewComment } from "@/types";
import { useLocation, useNavigate } from "react-router-dom";

type PostStatsProps = {
  post?: Models.Document;
  userId: string;
};

const PostStats = ({ post, userId  }: PostStatsProps) => {
  const likesList = post?.likes?.map((user: Models.Document) => user.$id) || [];
  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [addingComment, setAddingComment] = useState(false)
  const navigate = useNavigate()
  const location = useLocation();

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isPending: isSavingPost } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeletingSaved } =useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentuser();

  const savedPostRecord = currentUser?.save.find(
    (record: Models.Document) => record.post.$id === post?.$id
  );
  const [comments, setComments] = useState(post?.comment || []);

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser,comments.length, comments]);

  const handleLikePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    let newLikes = [...likes];

    const hasLiked = newLikes.includes(userId);

    if (hasLiked) {
      newLikes = newLikes.filter((id) => id !== userId);
    } else {
      newLikes.push(userId);
    }
    setLikes(newLikes);
    likePost({ postId: post?.$id || "", likesArray: newLikes });
  };

  const handleSavePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (savedPostRecord) {
      setIsSaved(false);
      deleteSavedPost(savedPostRecord.$id);
    } else {
      savePost({ postId: post?.$id || "", userId });
      setIsSaved(true);
    }
  };

  //commnets
  const { mutate: addComment } = useAddComment();

  const handleAddComment = async () => {
    if (commentContent.trim() !== "") {
      const newComment: INewComment = {
        postId: post?.$id || "",
        userId,
        commentContent,
      };
      setAddingComment(true)
      try {
        const addedComment = await addComment(newComment);
        setComments((prevComments:any) => [...prevComments, addedComment]);// Update local comments state
        setCommentContent(""); // Clear input after adding comment
      } catch (error) {
        console.error("Error adding comment:", error);
      }finally{
        setAddingComment(false)
        navigate(`/posts/${post?.$id}`)
      }
    }
  };

  const isPostDetailPage = location.pathname.startsWith("/posts/");


  return (
    <>
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
          <img
              src="/assets/comment.svg"
              alt="comment"
              width={20}
              height={20}
              className="cursor-pointer"
            />
            <p className="small-medium lg:base-medium">{comments.length}</p>
        </div>
        <div className="flex gap-2">
          {isSavingPost || isDeletingSaved ? (
            <Loader />
          ) : (
            <img
              src={isSaved ? "/assets/saved.svg" : "/assets/save.svg"}
              alt="share"
              width={20}
              height={20}
              className="cursor-pointer"
              onClick={(e) => handleSavePost(e)}
            />
          )}
        </div>
      </div>
      {!isPostDetailPage && (
        <div className="flex flex-col gap-2 mt-5">
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            className="bg-dark-4 rounded px-2 py-1"
          />
          <button
            onClick={handleAddComment}
            disabled={addingComment}
            className="bg-primary-500 text-white px-3 py-1 rounded cursor-pointer"
          >
            {addingComment ? <Loader /> : "Add Comment"}
          </button>
        </div>
      )}
    </>
  );
};

export default PostStats;
