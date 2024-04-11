import React, { useContext } from "react";
import { useState } from "react";
import axios from "axios";
import { StaggeredGrid, StaggeredGridItem } from "react-staggered-grid";

import Modal from "../components/Modal";
import {
  LocationIcon,
  ImageIcon,
  CloseIcon,
  LikeIcon,
  LikeFilledIcon,
  CommentIcon,
  CommentFilledIcon,
} from "../components/Icons";
import Scaffold from "../components/Scaffold";
import { Context } from "../context/ContextProvider";
import FullScreenLoading from "../components/FullScrenLoading";

function Profile() {
  const {
    showAlert,
    profileUser,
    setProfileUser,
    profilePosts,
    setProfilePosts,
    userID,
    place_id,
    city,
  } = useContext(Context);
  const [imagePreview, setImagePreview] = useState(null);

  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...profileUser });
  const [isLoading, setLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newAvatar, setNewAvatar] = useState(null);

  const handlePostSubmit = () => {
    setShowPostModal(false);

    const createPosts = async () => {
      const p = place_id;
      try {
        setLoading(true);
        const res = await axios.post(
          "http://localhost:8080/posts/create-post",
          { user_id: userID, title: "", content: postContent, place_id: p }
        );
        if (!res.data.error) {
          setProfilePosts((prevPosts) => [...prevPosts, res.data.response]);
        }
        // showAlert(res.data.message, res.data.error);
      } catch (error) {
        console.error("Error creating post:", error);
      } finally {
        setLoading(false);
      }

      setPostContent("");
      document.getElementById("postContent").value = "";
      setImagePreview(null);
    };
    createPosts();
  };

  const handleEditSubmit = async () => {
    try {
      // Make a PUT request to update the user's profile
      await axios.put(
        `http://localhost:8080/users/edit-user/${userID}`,
        editedUser
      );

      // Update the user state with the edited data
      setProfileUser(editedUser);
      setShowEditUserModal(false);
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prevUser) => ({ ...prevUser, [name]: value }));
  };
  const handleAvatarUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("avatar", newAvatar);

      // Make a request to update the user's avatar
      const response = await axios.put(
        `http://localhost:8080/users/update-avatar/${userID}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update the profileUser state with the new avatar URL
      setNewAvatar(newAvatar);
      setShowAvatarModal(false);
      setProfileUser((prevUser) => ({
        ...prevUser,
        avatar: response.data.avatar,
      }));
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  return profileUser != null ? (
    <Scaffold isLoading={isLoading}>
      <div>
        {/* Profile */}
        <div className="flex flex-col">
          <div className="md:flex items-center md:gap-5 gap-5 bg-gray-50 p-5 justify-between">
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-center gap-1">
                <div className="rounded-full md:h-20 md:w-20 h-10 w-10 bg-gray-200 overflow-hidden flex-shrink-0 relative">
                  <img
                    src={
                      profileUser.avatar
                        ? `http://localhost:8080/users-images/${profileUser.avatar}`
                        : "https://source.unsplash.com/random"
                    }
                    alt={profileUser.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  className="kTextButton"
                  onClick={() => setShowAvatarModal(true)}
                >
                  Change Avatar
                </button>
              </div>
              <div className="flex flex-col truncate">
                <h1 className="md:text-xl text-sm font-medium">
                  {profileUser.name}
                </h1>
                <h1 className="text-[15px] sm:text-lg md:text-lg text-gray-500">
                  {profileUser.email}
                </h1>
                <h1 className="text-sm text-gray-500 font-medium mt-2">
                  Posts {profilePosts.length}
                </h1>
              </div>
            </div>
            {/* Edit Profile Button */}
            <button
              type="button"
              className="border-2 rounded-lg px-5 py-1 text-sm font-medium text-blue-700 hover:border-gray-400 md:w-auto w-full md:mt-0 mt-5"
              onClick={() => {
                setShowEditUserModal(true);
              }}
            >
              Edit Profile
            </button>
          </div>

          {/* Create Post Button */}
          <button className="kButton" onClick={() => setShowPostModal(true)}>
            Create Post
          </button>

          {/* List of POST below */}
          <br />
          <br />
          <p className="text-gray-600 font-medium mb-5">Your Posts</p>

          <StaggeredGrid
            columnWidth={400}
            columns={0}
            alignment={1}
            horizontalGap={15}
            verticalGap={15}
            fitHorizontalGap={true}
          >
            {profilePosts
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((post, index) => (
                <StaggeredGridItem key={post._id} index={index}>
                  <PostCard postData={post} />
                </StaggeredGridItem>
              ))}
          </StaggeredGrid>
        </div>

        {/* Create POST Modal */}
        <Modal
          isOpen={showPostModal}
          toggleModal={() => {
            setShowPostModal(!showPostModal);
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <h1 className="font-medium text-xl">Create Post</h1>
            </div>
            <div className="flex gap-2 items-center mb-5">
              <div className="circleAvatar bg-gray-100">
                <img
                  src={
                    profileUser.avatar
                      ? `http://localhost:8080/users-images/${profileUser.avatar}`
                      : "https://source.unsplash.com/random"
                  }
                  alt={profileUser.name}
                />
              </div>
              <div>
                <h1 className="font-medium">{profileUser.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <LocationIcon size={"h-5 w-5"} color={"text-blue-700"} />
                  {city}
                </div>
              </div>
            </div>
            {/* Add Image */}
            {imagePreview == null ? (
              <button
                onClick={() => {
                  document.getElementById("postImagePicker").click();
                }}
                className="w-full rounded-xl mb-5 flex items-center gap-2 bg-gray-100 p-2 justify-center hover:bg-gray-200"
              >
                <ImageIcon size={"h-5 w-5"} color={"text-gray-500"} />
                <h1 className="font-medium text-gray-500">Add Image</h1>
              </button>
            ) : (
              <div className="w-full rounded-xl h-[200px] overflow-hidden relative mb-5">
                <img
                  src={imagePreview}
                  alt="picked-image"
                  className="h-full w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                  }}
                  className="absolute rounded-full h-7 w-7 bg-black right-[10px] top-[10px] flex justify-center items-center"
                >
                  <CloseIcon color={"text-white object-contain mx-auto"} />
                </button>
              </div>
            )}
            <input
              type="file"
              id="postImagePicker"
              className="hidden"
              accept=".jpeg, .jpg, .png, .webp"
              onChange={(e) => {
                setImagePreview(URL.createObjectURL(e.target.files[0]));
              }}
            />

            {/* Post Body */}
            <textarea
              name="postContent"
              id="postContent"
              rows={6}
              className="w-full p-2 bg-gray-100 rounded-xl mb-5"
              placeholder="What's on your mind?"
              onChange={(e) => {
                setPostContent(e.target.value);
              }}
            ></textarea>
            {/* Create Post Button and Cancel Button */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePostSubmit}
                className="kButton w-full"
              >
                Create Post
              </button>
              <button
                className="min-w-[200px] bg-black rounded-full text-white hover:bg-gray-700"
                onClick={() => {
                  document.getElementById("postContent").value = "";
                  setImagePreview(null);
                  setShowPostModal(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={showEditUserModal}
          toggleModal={() => {
            setShowEditUserModal(!showEditUserModal);
          }}
        >
          <div>
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 font-bold mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={editedUser.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-bold mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={editedUser.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Save and Cancel Button */}
            <div className="flex justify-end mt-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                onClick={handleEditSubmit}
              >
                Save
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowEditUserModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={showAvatarModal}
          toggleModal={() => setShowAvatarModal(!showAvatarModal)}
        >
          <div>
            <h2 className="text-xl font-bold mb-4">Change Avatar</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setNewAvatar(e.target.files[0]);
              }}
              className="mb-4"
            />
            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                onClick={() => {
                  setShowAvatarModal(false);
                  handleAvatarUpdate();
                }}
              >
                Save
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowAvatarModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Scaffold>
  ) : (
    <FullScreenLoading isLoading={!user} />
  );
}

export default Profile;

function PostCard({ postData }) {
  return (
    <div className="bg-white border rounded-xl">
      {postData.image !== "" ? (
        <div className="w-full rounded-t-xl bg-gray-100 mb-2 overflow-hidden">
          <img
            src={`http://localhost:8080/post-images/${postData.image}`}
            alt="post-index"
            className="object-contain h-full w-full"
          />
        </div>
      ) : (
        <></>
      )}

      <div className="p-2">
        <h2 className="font-bold text-gray-700 mb-2">{postData.title}</h2>

        <p className="line-clamp-3">{postData.content}</p>

        <div className="flex items-center gap-5 mt-2">
          <button className="flex items-center mt-2 gap-2 hover:bg-gray-200 rounded-full px-2">
            {!true ? (
              <LikeIcon color="text-gray-500" />
            ) : (
              <LikeFilledIcon color="text-gray-500" />
            )}

            <p className="font-medium text-gray-500">
              {(postData.likes && postData.likes.length) || "0"}
            </p>
          </button>
          {/* <button className="flex items-center mt-2 gap-2 hover:bg-gray-200 rounded-full px-2">
            {!true ? (
              <CommentIcon color="text-gray-500" />
            ) : (
              <CommentFilledIcon color="text-gray-500" />
            )}
            <p className="font-medium text-gray-500">12</p>
          </button> */}
        </div>
      </div>
    </div>
  );
}
