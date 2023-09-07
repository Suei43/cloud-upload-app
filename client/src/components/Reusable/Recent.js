import "../../index.css";
import { useState, useEffect } from "react";
import SharePopUp from "./SharePopUp";
import ImagePreview from "./ImagePreview";
import Cloudwavehome from "../../assets/Cloudwavehome.jpeg";
import Cookies from "js-cookie";
import axios from "axios";
import Loading from "./Loading";
import LoadingScreen from "./LoadingScreen";

export default function Recent({
  title,
  showAll,
  category,
  SearchResults,
  padding,
  headerPadding
}) {
  const [dropdownState, setDropdownState] = useState([]);
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);
  const [share, setShare] = useState(false);
  const [showPreview, setShowPreview] = useState([]);
  const [previewItemUrl, setPreviewItemUrl] = useState("");
  const [authToken, setAuthToken] = useState(Cookies.get("authToken"));
  const [data, setData] = useState([]);
  const [selectedItemData, setSelectedItemData] = useState(null);
  const [link, setLink] = useState("");
  const [fav, setFav] = useState("");
  const [loading, setLoading] = useState(true);
  const [renameFile, setRenameFile] = useState(false);
  const [newName, setNewName] = useState("");
  const [reFetch, setReFetch] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  let api;

  if (category) {
    api = `${process.env.REACT_APP_SERVER_URL}/api/files/${category}`;
  } else {
    api = `${process.env.REACT_APP_SERVER_URL}/api/files`;
  }

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function itemName(item) {
    if (viewportWidth < 500) {
      if (item.name.length < 11) return item.name;
      return item.name.slice(0, 14) + "...";
    } else {
      return item.name.length > 23 ? item.name.slice(0, 20) + "..." : item.name;
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setAllowDownload(false);
    }, 2000);
  }, [allowDownload]);
  
  const getFiles = async (authToken) => {
    try {
      const response = await axios.get(api, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      return response.data.files;
    } catch (error) {
      console.error("Files error:", error);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const filesData = await getFiles(authToken);
        setLoading(false);
        if (showAll === true) {
          setData(filesData);
        } else {
          setData(filesData.slice(-Math.min(5, filesData.length)).reverse());
        }
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    if (SearchResults) {
      setData(SearchResults);
      setLoading(false);
    } else if (authToken && !SearchResults) {
      fetchData();
    }
    return () => {};
  }, [authToken, reFetch]);


  const togglePreview = async (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownState(dropdownState.filter((itemIndex) => itemIndex !== item));
    if (showPreview.includes(item)) {
      setShowPreview(showPreview.filter((itemIndex) => itemIndex !== item));
    } else {
      setShowPreview([...showPreview, item]);
    }
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/api/image/${item.name}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
    const arrayBuffer = response.data;
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    uint8Array.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    const base64String = btoa(binary);
    const dataUrl = `data:image/jpeg;base64,${base64String}`;
    setPreviewItemUrl(dataUrl);

    // setPreviewItemUrl(Cloudwavehome);
  };

  useEffect(() => {
    function handleDocumentClick() {
      setDropdownState([]);
      setShowPreview([]);
    }
    document.body.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  function handleDropdownClick(index, e) {
    e.stopPropagation();
    if (dropdownState.includes(index)) {
      setDropdownState(
        dropdownState.filter((itemIndex) => itemIndex !== index),
      );
    } else {
      setDropdownState([...dropdownState, index]);
    }
  }

  useEffect(() => {
    async function fetchFile() {
      if (selectedItemData) {
        const file = await getFile(selectedItemData);
        setLink(file.link);
        if (allowDownload) window.open(file.link);
      }
    }
    fetchFile();
    return () => {};
  }, [selectedItemData]);

  async function getFile(name) {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/api/getfile/${name}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
      if (response.status === 200) {
        return response.data.file;
      }
    } catch (error) {
      console.error("Error fetching file:", error);
    }
  }

  function handleShare(e, item) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItemData(item.name);
    setShare(!share);
  }

  function handleDownload(e, item) {
    e.preventDefault();
    e.stopPropagation();
    setAllowDownload(true);
    setSelectedItemData(item.name);
  }

  const handleRename = async (e, name) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_SERVER_URL}/api/rename/${name}`,
        {
          newName: newName,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response.status === 200) {
        setRenameFile(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error renaming file:', error);
    }
  };

  // TODO INBUILT DOWNLOAD FILE
  // const handleDownload = async () => {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     setSelectedItemData(item.name);

  //     console.log("LINK: ", link)
  //     const fileURL = link;

  //     // Load the file object from the URL
  //     const file = File.fromURL(fileURL);

  //     // Download the file's data
  //     const data = await file.downloadBuffer();

  //     // Create a Blob from the data
  //     const blob = new Blob([data]);

  //     // Create a download link and trigger click
  //     const link = document.createElement('a');
  //     link.href = window.URL.createObjectURL(blob);
  //     link.download = 'image.jpg'; // Change the filename as needed
  //     link.click();

  //     // Clean up the Blob object
  //     window.URL.revokeObjectURL(link.href);
  //   };

  async function handleDelete(e, name) {
    setDropdownState([]);
    setLoadingScreen(true);
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_SERVER_URL}/api/delete/${name}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
      if (response.status === 200) {
        setData(data.filter((file) => file.name !== name));
        setLoadingScreen(false)
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }
  useEffect(() => {
    const updateFavorites = async () => {
      try {
        const response = await axios.patch(
          `${process.env.REACT_APP_SERVER_URL}/api/updatefav/${fav}`,
          {
            isFavorite: true,
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );
        console.log("Response: ", response);
      } catch (error) {
        console.error("Error updating favorites:", error);
      }
    };
    if (fav) {
      updateFavorites();
    }
    return () => {};
  }, [fav]);

  async function handleFav(e, item) {
    setLoadingScreen(true);
    e.preventDefault();
    e.stopPropagation();
    setFav(item.name);
    setDropdownState(
      dropdownState.filter((itemIndex) => itemIndex !== item),
    );
    setLoadingScreen(false);
    window.location.reload();
  }

  return (
    <div
      className={`h-full flex gap-y-4 flex-col p-12 ${
        padding ? padding : "px-0 md:px-4"
      } md:px-12 py-4 w-full`} id="recents"
    >
      {loadingScreen && <LoadingScreen />}
      {share && (
        <SharePopUp isOpen={share} link={link} width={"w-11/12 md:w-4/12"} />
      )}
      <h1 className={`text-blue-700 text-xl font-extrabold ${headerPadding && headerPadding}`}>{title}</h1>
      <div className={`flex flex-col gap-y-2.5`}>
        {loading && <Loading />}
        {data.length > 0
          ? data.map((item) => {
              return (
                <div
                  className={`flex flex-row justify-between bg-white p-2.5 rounded-xl items-center gap-x-1.5 pr-4 cursor-pointer hover:border hover:shadow-md noSelect`}
                  onClick={(e) => togglePreview(item, e)}
                  key={item.id}
                >
                  {showPreview.includes(item) && (
                    <div className="fixed top-0 left-0 flex justify-center items-center w-full h-screen z-50">
                      <div
                        className={`flex p-5 md:p-8 bg-slate-400 w-11/12 md:w-9/12 relative h-4/6 md:h-5/6 rounded-xl border`}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <button
                          className="absolute top-1 right-1 md:top-2 md:right-2 text-white"
                          onClick={(e) => {
                            togglePreview(item, e);
                          }}
                        >
                          <i className="fas fa-times-circle text-red-700 text-lg rounded-full"></i>
                        </button>
                        <ImagePreview
                          showImg={false}
                          imageUrl={Cloudwavehome}
                          item={item}
                        />
                      </div>
                    </div>
                  )}
                  <div className="bg-indigo-500 p-2 rounded-lg w-9 h-9 flex items-center justify-center">
                    <i className={`fas ${item.icon ? item.icon : 'fa-file-alt'} text-white text-sm`}></i> 
                  </div>
                  { renameFile === true ? (
                    <input
                      type="text"
                      className="w-8/12 md:w-10/12 text-sm md:text-base text-slate-700 font-bold p-2"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                      onBlur={() => setRenameFile(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          setDropdownState([])
                          handleRename(e, item.name);
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-row w-9/12 justify-between items-center">
                      <h2 className={`break-all md:break-normal w-9/12 p-2 text-sm md:text-md`}>
                        {itemName(item)}
                      </h2>
                      <div
                        className="px-1 rounded-full hover:bg-gray-200 hover:bg-slate-100"
                        onClick={(e) => handleShare(e, item)}
                      >
                        <i className="fas fa-share-alt text-indigo-500 cursor-pointer"></i>
                      </div>
                  </div>
                  ) }
                  <div
                    className={`${
                      showPreview.includes(item) ? " " : "relative"
                    } w-2/12 text-right`}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center p-1 focus:outline-none hover:bg-gray-100 hover:bg-slate-100 rounded-2xl"
                      onClick={(e) => handleDropdownClick(item, e)}
                    >
                      <i className="fas fa-ellipsis-h text-indigo-500 text-lg z-10"></i>
                    </button>
                    {dropdownState.includes(item) && (
                      <div className="origin-top-right absolute right-0 mt-2 w-36 md:w-40 rounded-md shadow-lg bg-slate-300 ring-1 ring-black ring-opacity-5 z-50">
                        <div
                          class="py-1 flex flex-col"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="options-menu"
                        >
                          <button
                            className="px-4 relative py-2 text-xs md:text-sm text-gray-700 hover:bg-slate-200 w-full flex flex-row justify-between items-center"
                            role="menuitem"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDropdownState(
                                dropdownState.filter((itemIndex) => itemIndex !== item),
                              );
                              setRenameFile(true)}}
                          >
                            <span>Rename</span>
                            <i
                              className={`fas fa-pen text-xs text-slate-700 absolute right-3`}
                            ></i>
                          </button>
                          <button
                            className="px-4 py-2 relative text-xs md:text-sm text-gray-700 hover:bg-slate-200 w-full flex flex-row justify-between items-center border-b"
                            role="menuitem"
                            onClick={(e) => handleDownload(e, item)}
                          >
                            <span>Download</span>
                            <i className="fas fa-download text-xs text-blue-500 absolute right-3"></i>
                          </button>
                          <button
                            className="px-4 relative py-2 text-xs md:text-sm text-gray-700 hover:bg-slate-200 w-full flex flex-row justify-between items-center border-b text-left"
                            role="menuitem"
                            onClick={(e) => handleFav(e, item)}
                          >
                            <span>
                              {(item.isFavorite === false) | undefined
                                ? "Add to favorites"
                                : "Remove from favorites"}
                            </span>
                            <i
                              className={`fas fa-star text-sm  absolute right-2.5 ${
                                item.isFavorite === true ? "text-amber-500" : "text-white"
                              }`}
                            ></i>
                          </button>
                          <button
                            className="px-4 relative py-2 text-xs md:text-sm text-gray-700 hover:bg-slate-200 w-full flex flex-row justify-between items-center"
                            role="menuitem"
                            onClick={(e) => handleDelete(e, item.name)}
                          >
                            <span>Delete</span>
                            <i
                              className={`fas fa-trash text-xs text-red-700 absolute right-3`}
                            ></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          : !loading && (
              <div className="text-xl md:text-2xl pt-6 text-center text-slate-400">
                No {category ? category : 'files'} {category === "audio" && "files"} found..
              </div>
            )}
      </div>
    </div>
  );
}
