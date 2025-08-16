"use client";
import React, { useEffect } from "react";
// Clerk에서 현재 로그인한 사용자 정보, 로그인 상태 등을 가져오는 훅
import { useUser } from "@clerk/nextjs";
// 아이콘 컴포넌트 (사진 아이콘)
import { HiOutlinePhotograph } from "react-icons/hi";
// React 훅 불러오기
import { useState, useRef } from "react";
// 미리 firebase가 초기화된 모듈 import (app)
import { app } from "@/firebase";
// Firebase Storage 관련 함수들 import
import {
  getStorage, // Storage 인스턴스 얻기
  ref, // Storage 내 저장 경로 참조 생성
  uploadBytes, // 파일 업로드 (즉시 완료)
  getDownloadURL, // 업로드된 파일 URL 가져오기
  uploadBytesResumable, // 업로드 상태 추적 가능한 업로드 함수
} from "firebase/storage";

export default function Input() {
  // Clerk 훅으로 로그인한 사용자 정보 및 상태 가져오기
  const { user, isSignedIn, isLoaded } = useUser();
  // 파일 입력(input type=file)에 대한 참조를 만듦 (JS에서 클릭 트리거용)
  const imagePickRef = useRef(null);

  // **로그인 여부 및 유저 데이터 로딩 완료 체크**
  // 로그인이 안 되어 있거나 사용자 정보가 아직 준비되지 않았다면,
  // 컴포넌트를 렌더링하지 않고 null 반환 (빈 화면)
  // 이렇게 하면 인증된 사용자만 UI를 보게 됨
  if (!isSignedIn || !isLoaded) {
    return null;
  }

  // 선택한 이미지 파일 상태
  const [selectedFile, setSelectedFile] = useState(null);
  // 이미지 미리보기 URL 상태
  const [imageFileUrl, setImageFileUrl] = useState(null);
  // 업로드 진행 중인지 여부 상태 (업로드 시 로딩 UI용)
  const [imageFileUploading, setImageFileUploading] = useState(false);

  const [text, setText] = useState("");
  const [postLoading, setPostLoading] = useState(false);

  // 파일 선택 시 이벤트 핸들러
  const addImageToPost = (e) => {
    const file = e.target.files[0]; // 사용자가 선택한 첫 번째 파일
    if (file) {
      setSelectedFile(file); // 선택 파일 상태 저장
      setImageFileUrl(URL.createObjectURL(file)); // 브라우저에서 미리보기용 URL 생성
    }
  };

  // selectedFile 상태가 바뀔 때마다(파일 선택 시) 자동으로 이미지를 Firebase에 업로드
  useEffect(() => {
    if (selectedFile) {
      uploadImageToStorage();
    }
  }, [selectedFile]);

  // Firebase Storage에 이미지 업로드 함수 (비동기)
  const uploadImageToStorage = async () => {
    if (!selectedFile) return; // 선택된 파일 없으면 종료
    setImageFileUploading(true); // 업로드 상태 true로 변경해서 UI 반영

    const storage = getStorage(app); // Firebase Storage 인스턴스 얻기
    // 유니크한 파일명 생성 (현재시간 + 원본 파일명)
    const fileName = new Date().getTime() + " " + selectedFile.name;
    // images 폴더 아래 새 파일 경로 참조 생성
    const storageRef = ref(storage, `images/${fileName}`);

    // 업로드 진행 관리 가능한 Resumable 업로드 시작
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    // 업로드 상태 변경 리스너 등록
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // 진행률 계산 (바이트 단위)
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done"); // 진행률 로그
      },
      (error) => {
        // 업로드 실패 시 실행
        setImageFileUploading(false); // 업로드 끝났으므로 false로
        setSelectedFile(null); // 선택 파일 초기화(취소)
        setImageFileUrl(null); // 미리보기 이미지 URL 초기화
        console.error("Upload failed:", error);
      },
      async () => {
        // 업로드 성공 시 실행
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setImageFileUrl(downloadURL); // Firebase 저장소 URL로 상태 업데이트 (실제 이미지 주소)
        setImageFileUploading(false); // 업로드 끝나서 false로
      }
    );

    // 아래 setImageFileUploading(false)는 위 콜백 안에서 이미 처리하므로 불필요함
    // 주석 처리해도 무방함
    // setImageFileUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPostLoading(true); // 포스트 로딩 상태 true로 설정
    const response = await fetch("/api/post/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userMongoId: user.publicMetadata.userMongoId,
        name: user.fullName,
        username: user.username,
        imageUrl: imageFileUrl,
        text,
        profileImg: user.imageUrl,
        image: imageFileUrl,
      }),
    });
    setPostLoading(false); // 포스트 로딩 상태 false로 설정
    setText(""); // 포스트 작성 후 입력창 초기화
    setSelectedFile(null); // 선택된 파일 초기화
    setImageFileUrl(null); // 이미지 미리보기 URL 초기화

    if (response.ok) {
      // 포스트 생성 성공
      const newPost = await response.text();
      console.log("Post created:", newPost);
    } else {
      // 포스트 생성 실패
      console.error("Failed to create post");
    }
    // location.reload(); // 페이지 새로고침 (새 포스트 반영)
  };

  if (!isSignedIn || !isLoaded) {
    return null;
  }
  return (
    <div className="flex border-b border-gray-200 p-3 space-x-3 w-full">
      {/* 로그인한 사용자 프로필 이미지 표시 */}
      <img
        src={user.imageUrl}
        alt="user-img"
        className="h-11 w-11 rounded-full cursor-pointer hover:brightness-95 object-cover"
      />
      <div className="w-full divide-y divide-gray-200">
        {/* 트윗 내용 입력용 textarea */}
        <textarea
          className="w-full border-none outline-none tracking-wide min-h-[50px] text-gray-700 placeholder-gray-400 text-lg"
          placeholder="What's happening?"
          rows="2"
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>

        {/* 선택한 이미지 파일이 있으면 미리보기 표시 */}
        {selectedFile && (
          <img
            onClick={() => {
              // 이미지 클릭 시 선택 파일 및 미리보기 초기화 (취소)
              setSelectedFile(null);
              setImageFileUrl(null);
            }}
            src={imageFileUrl}
            alt="imageFileUrl"
            className={`w-full max-h-[250px] object-cover cursor-pointer ${
              imageFileUploading ? "animate-pulse" : ""
            }`}
          />
        )}

        <div className="flex items-center justify-between pt-2.5">
          {/* 사진 아이콘 클릭 시 hidden file input 클릭 트리거 */}
          <HiOutlinePhotograph
            className="h-10 w-10 p-2 text-sky-500 hover:bg-sky-100 rounded-full cursor-pointer transition-all duration-200"
            onClick={() => imagePickRef.current.click()}
          />

          {/* 실제 이미지를 선택하는 input (hidden) */}
          <input
            type="file"
            className="hidden"
            ref={imagePickRef}
            accept="image/*"
            hidden
            onChange={addImageToPost} // 파일 선택 시 처리 함수 호출
          />

          {/* Post 버튼 (비활성화 상태) */}
          <button
            disabled={text.trim() === "" || postLoading || imageFileUploading}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-1 px-4 rounded-full transition-all duration-200"
            onClick={handleSubmit}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
