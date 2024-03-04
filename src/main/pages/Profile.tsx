import { Button } from "@/components/ui/button";
import GridPostList from "@/components/ui/global-components/GridPostList";
import Loader from "@/components/ui/global-components/Loader";
import { useUserContext } from "@/context/AuthContext";
import { useAddUser, useGetUserById } from "@/lib/react-query/queriesAndMutations";
import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import LikedPosts from "./LikedPosts";
import { addUser, removeUser } from "@/lib/appwrite/api";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { title } from "process";



interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { user,setUser } = useUserContext();
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { data: currentUser } = useGetUserById(id || "");

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );


    const isFriend = currentUser?.connections?.includes(user.id) && user?.connections?.includes(currentUser.$id);

    const handleAddUser = async () => {
      setLoading(true)
      try {
        const response = await addUser(currentUser.$id, user.id);
        console.log('User added successfully:', response);
        setUser({
          ...user,
          connections: response.data.connections,
        });
    console.log('response',response.data)

      } catch (error) {
        console.error('Error adding user:', error);
      } finally {
        setLoading(false)
        toast({ title: `${currentUser.name} has been Added`})
        navigate('/')

      }
    };

    const handleRemoveUser = async () => {
      setLoading(true)
      try {
        const response = await removeUser(currentUser.$id, user.id);
        console.log('User removed successfully:', response);
        setUser({
          ...user,
          connections: response.data.connections,
        });
      } catch (error) {
        console.error('Error removing user:', error);
      } finally {
        setLoading(false)
        toast({ title: `${currentUser.name} is removed from your connections`})
        navigate('/')
      }
    };

    console.log('userconnections',user.connections)
    console.log('currentUser',currentUser.connections)
    
 

    


  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={
              currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"
            }
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser.username}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={currentUser.posts.length} label="Posts" />
              <StatBlock value={currentUser.connections.length} label="Connections" />

            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {currentUser.bio}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <div className={`${user.id !== currentUser.$id && "hidden"}`}>
              <Link
                to={`/update-profile/${currentUser.$id}`}
                className={`h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg ${
                  user.id !== currentUser.$id && "hidden"
                }`}>
                <img
                  src={"/assets/edit.svg"}
                  alt="edit"
                  width={20}
                  height={20}
                />
                <p className="flex whitespace-nowrap small-medium">
                  Edit Profile
                </p>
              </Link>
            </div>
            <div className={`${user.id === id && "hidden"}`}>
 {isFriend ? (
    <Button onClick={handleRemoveUser} type="button" className="bg-dark-4 px-8">
      {loading ? <Loader /> : 'Friends'}
    </Button>
 ) : (
    <Button onClick={handleAddUser} type="button" className="shad-button_primary px-8">
      {loading ? <Loader /> : 'Connect'}
    </Button>
 )}
</div>
          </div>
        </div>
      </div>

      {currentUser.$id === user.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${
              pathname === `/profile/${id}` && "!bg-dark-3"
            }`}>
            <img
              src={"/assets/posts.svg"}
              alt="posts"
              width={20}
              height={20}
            />
            Posts
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-lg ${
              pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"
            }`}>
            <img
              src={"/assets/like.svg"}
              alt="like"
              width={20}
              height={20}
            />
            Liked Posts
          </Link>
        </div>
      )}

      <Routes>
        <Route
          index
          element={<GridPostList posts={currentUser.posts} showUser={false} />}
        />
        {currentUser.$id === user.id && (
          <Route path="/liked-posts" element={<LikedPosts />} />
        )}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;