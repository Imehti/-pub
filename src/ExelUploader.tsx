import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExelUploader: React.FC = () => {
  const [data, setData] = useState<any[]>([]); // State for table data
  const [columns, setColumns] = useState<string[]>([]); // State for column names
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set()); // State for selected rows

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const binaryResult = event.target?.result;
      const workbook = XLSX.read(binaryResult, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

      if (jsonData.length > 0) {
        const tableCols = Object.keys(jsonData[0]);
        setColumns(tableCols);
        setData(jsonData);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCheckbox = (row: any) => {
    setSelectedRows((prevSelectedRows) => {
      const updatedRows = new Set(prevSelectedRows);
      if ([...updatedRows].some((selectedRow) => selectedRow === row)) {
        // Remove the row if already selected
        updatedRows.delete(row);
      } else {
        // Add the row if not selected
        updatedRows.add(row);
      }
      return updatedRows;
    });
  };

  let blob = new Blob();
  const handleDownload = () => {
    if (selectedRows.size > 0) {
      blob = new Blob([JSON.stringify([...selectedRows], null, 2)], {
        type: "application/json",
      });
    } else {
      blob = new Blob([JSON.stringify([...data], null, 2)], {
        type: "application/json",
      });
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      selectedRows.size > 0 ? "selected_rows.json" : "table.json"
    }`;
    link.click();
  };

  const updateData = (rowIndex: number, columnId: string, value: string) => {
    setData((oldData) =>
      oldData.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...row,
            [columnId]: value,
          };
        }
        return row;
      })
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-red-800">
        Upload your Excel file
      </h1>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleUpload}
        className="block mb-4 p-2 border rounded"
      />
      {data.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-sm text-left border border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-2 font-medium bg-gray-100 text-center border border-black">
                    Select
                  </th>
                  {columns.map((col, index) => (
                    <th
                      key={index}
                      className="px-4 py-2 font-medium bg-gray-100 text-center border border-black"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-50 border border-black"
                  >
                    {/* Checkbox Column */}
                    <td className="text-center border border-black">
                      <input
                        type="checkbox"
                        checked={[...selectedRows].some(
                          (selectedRow) => selectedRow === row
                        )}
                        onChange={() => handleCheckbox(row)}
                      />
                    </td>

                    {/* Data Columns */}
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-4 py-2 text-center border border-black whitespace-nowrap"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          updateData(rowIndex, col, e.target.innerText)
                        }
                      >
                        {row[col as keyof typeof row]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={handleDownload}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {selectedRows.size > 0
              ? "Download selected rows as json"
              : "Download table as json"}
          </button>
        </>
      )}
    </div>
  );
};

export default ExelUploader;
