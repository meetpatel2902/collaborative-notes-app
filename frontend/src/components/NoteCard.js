import React from 'react';
import { Link } from 'react-router-dom';

const NoteCard = ({ note, onDelete }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <Link to={`/notes/${note._id}`} className="block">
                <h3 className="text-xl font-semibold text-blue-700 mb-2 truncate">
                    {note.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {note.content}
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                    {note.tags && note.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
            </Link>
            <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>
            <button
                onClick={() => onDelete(note._id)}
                className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-md focus:outline-none focus:shadow-outline"
            >
                Delete
            </button>
        </div>
    );
};

export default NoteCard;