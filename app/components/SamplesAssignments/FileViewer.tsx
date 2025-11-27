"use client";

import { FC, useState } from "react";
import { usePathname } from "next/navigation";
import Button from "../Button/Button";
import Link from "next/link";

interface FileViewerProps {
  fileName: string;
}
const FileViewer: FC<FileViewerProps> = ({ fileName }) => {
  const currentPage = usePathname();
  // const fileUrl = `/storage/${fileName}`;
  const fileUrl = `/storage/${fileName}`;
  return (
    <div className="flex justify-center">
      <Link href={fileUrl} target="_blank" rel="noopener noreferrer">
        <Button className="bg-secondary-500 hover:text-secondary-500 hover:border-secondary-500">
          View Sample
        </Button>
      </Link>
    </div>
  );
};

export default FileViewer;
