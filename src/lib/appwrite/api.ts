import { INewComment, INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDb({
      accountId: newAccount.$id,
      email: newAccount.email,
      name: newAccount.name,
      imageUrl: avatarUrl,
      username: user.username,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function saveUserToDb(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailSession(user.email, user.password);
    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );
    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      //width
      2000,
      //height
      2000,
      //where its going to show
      "top",
      //quality
      100
    );
    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { message: "done" };
  } catch (error) {
    console.log(error);
  }
}

export async function createPost(post: INewPost) {
  try {
    //upload image to storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // get the url
    const fileUrl = getFilePreview(uploadedFile.$id);

    if (!fileUrl) {
      deleteFile(uploadedFile.$id);
      throw Error;
    }

    //conver tags in an array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );
    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

export async function getRecentPosts() {
  const posts = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.postsCollectionId,
    [Query.orderDesc("$createdAt"), Query.limit(20)]
  );

  if (!posts) throw Error;

  return posts;
}

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function savePost(postId: string, userId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );
    if (!updatedPost) {
      throw Error;
    }
    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );
    if (!statusCode) {
      throw Error;
    }
    return { status: "done" };
  } catch (error) {
    console.log(error);
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId
    );
    return post;
  } catch (error) {
    console.log(error);
  }
}

export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      //upload image to storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;
      // get the url
      const fileUrl = getFilePreview(uploadedFile.$id);

      if (!fileUrl) {
        deleteFile(uploadedFile.$id);
        throw Error;
      }
      image = {...image, imageUrl: fileUrl, imageId: uploadedFile.$id}
    }

    //conver tags in an array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );
    if (!updatedPost) {
      await deleteFile(post.imageId);
      throw Error;
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deletePost(postId: string, imageId:string){
  if(!postId || !imageId) throw Error

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId
    )
    return {status: 'deleted'}
  } catch (error) {
    console.log(error)
  }
}

export async function getInfinitePosts({pageParam} :{ pageParam: number}){
  const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)]
  if(pageParam){
    queries.push(Query.cursorAfter(pageParam.toString()))
  }
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      queries
    )
    if(!posts) throw Error

    return posts
  } catch (error) {
    console.log(error)
  }
}

export async function searchPosts(searchTerm: string){
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      [Query.search('caption', searchTerm)]
    )
    if(!posts) throw Error

    return posts
  } catch (error) {
    console.log(error)
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

export async function addComment({ postId, userId, commentContent }: INewComment) {
  try {
    // First, create the comment object to be added
    const comment = {
      content: commentContent,
      author: userId,
      post: postId,
    };

    // Now, add the comment to the comments collection in your database
    const newComment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      ID.unique(),
      comment
    );

    if (!newComment) {
      throw new Error("Failed to add comment");
    }

    // Next, update the post with the new comment
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId
    );

    if (!post) {
      throw new Error("Post not found");
    }

    let updatedComments = [];
    if (post.comment && Array.isArray(post.comment)) {
      updatedComments = [...post.comment, newComment.$id];
    } else {
      updatedComments = [newComment.$id];
    }

    // Update the post with the new comment
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postsCollectionId,
      postId,
      {
        comment: updatedComments,
      }
    );

    if (!updatedPost) {
      throw new Error("Failed to update post with comment");
    }

    return newComment;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}


export async function addUser(currentUser: string, newConnectionId: string) {
  try {
    // Get the current user
    const user: any = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      currentUser
    );

    if (!user) {
      throw new Error('User not found');
    }

    // Update the current user's connections array
    const updatedConnectionsCurrentUser = [...user.connections, newConnectionId];

    // Update the current user's document with the new connections
    const responseCurrentUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      currentUser,
      {
        connections: updatedConnectionsCurrentUser,
      }
    );
    console.log('Connection added successfully for current user:', responseCurrentUser);

    // Get the new connection's user
    const newConnectionUser: any = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      newConnectionId
    );

    if (!newConnectionUser) {
      throw new Error('New connection user not found');
    }

    // Update the new connection's user's connections array
    const updatedConnectionsNewConnectionUser = [...newConnectionUser.connections, currentUser];

    // Update the new connection's user's document with the new connections
    const responseNewConnectionUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      newConnectionId,
      {
        connections: updatedConnectionsNewConnectionUser,
      }
    );
    console.log('Connection added successfully for new connection user:', responseNewConnectionUser);

    // Return the updated connections for the current user
    return responseCurrentUser;
  } catch (error) {
    console.error('Error adding connection:', error);
    throw new Error('Error adding connection');
  }
}

export async function removeUser(currentUser: string, connectionToRemove: string) {
  try {
    // Get the current user
    const user: any = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      currentUser
    );

    if (!user) {
      throw new Error('User not found');
    }

    // Update the current user's connections array
    const updatedConnectionsCurrentUser = user.connections.filter(
      (connectionId: string) => connectionId !== connectionToRemove
    );

    // Update the current user's document with the new connections
    const responseCurrentUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      currentUser,
      {
        connections: updatedConnectionsCurrentUser,
      }
    );
    console.log('Connection removed successfully for current user:', responseCurrentUser);

    // Get the user to remove connection from
    const connectionToRemoveUser: any = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      connectionToRemove
    );

    if (!connectionToRemoveUser) {
      throw new Error('Connection to remove user not found');
    }

    // Update the connection to remove user's connections array
    const updatedConnectionsToRemoveUser = connectionToRemoveUser.connections.filter(
      (connectionId: string) => connectionId !== currentUser
    );

    // Update the connection to remove user's document with the new connections
    const responseToRemoveUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      connectionToRemove,
      {
        connections: updatedConnectionsToRemoveUser,
      }
    );
    console.log('Connection removed successfully for connection to remove user:', responseToRemoveUser);

    // Return the updated connections for the current user
    return responseCurrentUser;
  } catch (error) {
    console.error('Error removing connection:', error);
    throw new Error('Error removing connection');
  }
}