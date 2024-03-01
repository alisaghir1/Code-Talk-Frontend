import { useDeletePost, useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loader from "@/components/ui/global-components/Loader";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import PostStats from "@/components/ui/global-components/PostStats";

const PostDetails = () => {
  const { id } = useParams();
  const { data: post, isPending } = useGetPostById(id || "");
  const { user } = useUserContext();
  const { mutate: deletePost } = useDeletePost();
  const navigate = useNavigate()

  const handleDeletePost = () => {
    deletePost({ postId: id || '', imageId: post?.imageId });
    navigate(-1);
  };


  return (
    <div className="post_details-container">    
      {isPending ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <img
            src={post?.imageUrl}
            alt="post-img"
            className="post_details-img"
          />
          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.creator.$id}`}
                className="flex items-center gap-3"
              >
                <img
                  src={
                    post?.creator?.imageUrl || "assets/profile-placeholder.svg"
                  }
                  alt="creator-pic"
                  className="rounded-full w-8 h-8 lg:h-12 lg:w-12"
                />
                <div className="flex flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name}
                  </p>
                </div>
                <div className="flex-center gap-2 text-light-3">
                  <p className="subtle-semibold lg:small-regular">
                    {multiFormatDateString(post?.$createdAt)}
                  </p>
                  -
                  <p className="subtle-semibold lg:small-regular">
                    {post?.location}
                  </p>
                </div>
              </Link>

              <div className="flex-center gap-1">
                <Link
                  to={`/update-post/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id && "hidden"}`}
                >
                  <img
                    src="/assets/edit.svg"
                    alt="edit-icon"
                    width={24}
                    height={24}
                  />
                </Link>
                <Button
                  onClick={handleDeletePost}
                  variant="ghost"
                  className={`ghost_details-delete_btn ${
                    user.id !== post?.creator.$id && "hidden"
                  }`}
                >
                  <img
                    src="/assets/delete.svg"
                    alt="delete-icon"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>
            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag: string) => (
                  <li key={tag} className="text-light-3">
                    #{tag}
                  </li>
                ))}
              </ul>
              
            </div>
            

            <div className="w-full">
              <PostStats post={post} userId={user.id}/>
              <div className="post_comments-section">
            <h3 className="post_comments-heading mb-20">Comments</h3>
            {post?.comment.map((comment: any) => (
              <div key={comment.$id} className="post_comment">
                <div className="post_comment-user">
                  <img
                    className="post_comment-avatar"
                    src={comment.author.imageUrl}
                    alt={comment.author.username}
                  />
                  <span className="post_comment-username">
                    {comment.author.username}
                  </span>
                </div>
                <p className="post_comment-text">{comment.content}</p>
              </div>
            ))}
          </div>
            </div>

          </div>
          
        </div>
        
      )}
      
    </div>
  );
};

export default PostDetails;
