import React, { useEffect, useState } from "react";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";
import AddEditNotes from "./AddEditNotes";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
//import axios from "axios";
import { toast } from "react-toastify";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import api from "../../api";

const Home = () => {
  const { currentUser, loading, errorDispatch } = useSelector(
    (state) => state.user
  );
  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([]);

  const [isSearch, setIsSearch] = useState();
  const [openAddEditModel, setOpenAddEditModel] = useState({
    isShow: false,
    type: "add",
    data: null,
  });

  const navigate = useNavigate();
  useEffect(() => {
    if (!currentUser || currentUser === null) {
      navigate("/login");
    } else {
      setUserInfo(currentUser.rest);
      getAllNotes();
    }
  }, []);
  //get all note
  const getAllNotes = async () => {
    try {
      const res = await api.get("/api/note/all", {
        withCredentials: true,
      });
      if (res.data.success === false) {
        console.log(res.data);
        return;
      }

      setAllNotes(res.data.notes);
    } catch (error) {
      console.log(error);
    }
  };
  const handleEdit = async (noteDetails) => {
    setOpenAddEditModel({ isShow: true, data: noteDetails, type: "edit" });
  };
  // Delete
  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const res = await api.delete(
        "/api/note/delete/" + noteId,
        { withCredentials: true }
      );
      if (res.data.success === false) {
        //console.log(res.data.message);
        //setError(error.data.message);
        toast.error(res.data.message);
        return;
      }
      toast.success(res.data.message);
      getAllNotes();
    } catch (error) {
      //console.log(error.message);
      //setError(error.message);
      toast.error(error.message);
    }
  };
  const handleClearSearch = () => {
    setIsSearch(false);

    getAllNotes();
  };
  const onSearchNote = async (query) => {
    try {
      const res = await api.get("/api/note/search", {
        params: { query },
        withCredentials: true,
      });
      if (res.data.success === false) {
        console.log(res.data.message);
        toast.error(res.data.message);
        return;
      }
      setAllNotes(res.data.notes);
      setIsSearch(true);
    } catch (error) {
      toast.error(error.message);
      console.log(error.message);
    }
  };

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const res = await api.put(
        "/api/note/update-note-pinned/" + noteId,
        {
          isPinned: !noteData.isPinned,
        },
        { withCredentials: true }
      );
      if (res.data.success === false) {
        console.log(res.data.message);
        toast.error(res.data.message);
        return;
      }
      toast.success(res.data.message);
      getAllNotes();
    } catch (error) {
      //toast.error(error.message);
      console.log(error.message);

    }
  };
  return (
    <>
      <Navbar
        userInfo={userInfo}
        handleClearSearch={handleClearSearch}
        onSearchNote={onSearchNote}
      />
      {/* <div className="container mx-auto "> */}
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {allNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8 max-md:m-5 ">
            {allNotes.map((note, index) => (
              <NoteCard
                key={note._id}
                title={note.title}
                date={note.createAt}
                content={note.content}
                tags={note.tags}
                isPinned={note.isPinned}
                onEdit={() => {
                  handleEdit(note);
                }}
                onDelete={() => {
                  deleteNote(note);
                }}
                onPinNote={() => {
                  updateIsPinned(note)
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            imgSrc={
              isSearch
                ? "https://media.istockphoto.com/id/1415203156/vector/error-page-page-not-found-vector-icon-in-line-style-design-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=RuQ_sn-RjAVNKOmARuSf1oXFkVn3OMKeqO5vw8GYoS8="
                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrAwxGgGCxxg453Bd7O_ygX_ZmoyDtbPjXSCtt-XNmGtWh5jEn8AS-9ltv5yllY5K61dU&usqp=CAU"
            }
            message={
              isSearch
                ? "Rất tiếc! Không tìm thấy ghi chú nào khớp với tìm kiếm của bạn."
                : "Sẵn sàng ghi lại ý tưởng của bạn? Nhấn nút Thêm để bắt đầu ghi chú những suy nghĩ, cảm hứng và lời nhắc của bạn. Hãy bắt đầu ngay!"
            }
          />
        )}
      </div>
      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-[#2B85FF]  hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() =>
          setOpenAddEditModel({
            isShow: true,
            type: "add",
            data: null,
          })
        }
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModel.isShow}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-md:w-[60] max-sm:w-[70%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          onClose={() =>
            setOpenAddEditModel({
              isShow: false,
              type: "add",
              data: null,
            })
          }
          noteData={openAddEditModel.data}
          type={openAddEditModel.type}
          getAllNotes={getAllNotes}
        />
      </Modal>
    </>
  );
};

export default Home;
