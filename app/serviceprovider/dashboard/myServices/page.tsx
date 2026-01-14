'use client';

import React, { useState, useMemo } from 'react';
import { Search, Edit2, Video, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
interface Venue {
  id: string;
  name: string;
  type: string;
  category: string;
 
  price: number;
  status: 'Published' | 'Unpublished';
  createdDate: string;
  image: string;
}

const ITEMS_PER_PAGE = 8;

const venues: Venue[] = [
  {
    id: "1",
    name: 'Grand Palace Hall',
    type: 'Wedding Hall',
    category: 'Entertainment',
   
    price: 150000,
    status: 'Published',
    createdDate: 'Dec 15, 2024',
    image: '🏛️'
  },
  {
    id: "2",
    name: 'Tech Conference Center',
    type: 'Conference Hall',
    category: 'Entertainment',
   
    price: 80000,
    status: 'Published',
    createdDate: 'Dec 10, 2024',
    image: '🏢'
  },
  {
    id: "3",
    name: 'Garden Paradise',
    type: 'Outdoor Venue',
    category: 'Entertainment',
   
    price: 120000,
    status: 'Unpublished',
    createdDate: 'Dec 8, 2024',
    image: '🌳'
  },
  {
    id: '4',
    name: 'Royal Banquet Hall',
    type: 'Banquet Hall',
    category: 'Decor',
   
    price: 135000,
    status: 'Published',
    createdDate: 'Dec 5, 2024',
    image: '👑'
  },
  {
    id: "5",
    name: 'Sky Lounge Rooftop',
    type: 'Rooftop Venue',
    category: 'Decor',
    
    price: 95000,
    status: 'Unpublished',
    createdDate: 'Dec 1, 2024',
    image: '🌆'
  },
  {
    id: "6",
    name: 'Private Dining Suite',
    type: 'Restaurant',
    category: 'Decor',
    
    price: 45000,
    status: 'Published',
    createdDate: 'Nov 28, 2024',
    image: '🍽️'
  }
];

export default function VenueManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
const router = useRouter();
  const filteredVenues = useMemo(() => {
    return venues.filter(venue =>
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredVenues.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentVenues = filteredVenues.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const HandleEdit=async(id:string)=>{
    router.push("/serviceprovider/dashboard/myServices/"+id)
  }
  


  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen  ">
      <div className="">
        {/* Header */}
        <div className=" flex justify-between p-[32px]">
          <h1 className="font-inter font-bold text-2xl leading-8 tracking-normal">My Services</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by venue name"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 text-left font-inter font-medium text-sm leading-none tracking-normal  text-[#676767]">Venue Name</th>
                  <th className="px-6 py-4 text-left font-inter font-medium text-sm leading-none tracking-normal  text-[#676767]">Category</th>
                  
                  <th className="px-6 py-4 text-left font-inter font-medium text-sm leading-none tracking-normal  text-[#676767]">Price</th>
                  <th className="px-6 py-4 text-left font-inter font-medium text-sm leading-none tracking-normal  text-[#676767]">Status</th>
                  <th className="px-6 py-4 text-left font-inter font-medium text-sm leading-none tracking-normal  text-[#676767]">Created Date</th>
                  <th className="px-6 py-4 text-left font-inter font-medium text-sm leading-none tracking-normal  text-[#676767]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentVenues.map((venue) => (
                  <tr key={venue.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-2xl">
                          {venue.image}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{venue.name}</div>
                          <div className="text-sm text-gray-500">{venue.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{venue.category}</td>
               
                    <td className="px-6 py-4 font-semibold text-gray-900">${venue.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        venue.status === 'Published' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-[#B74140]'
                      }`}>
                        {venue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{venue.createdDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={()=>{HandleEdit(venue.id)}} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        <button className="p-2 text-[#B74140] hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-4">
          {currentVenues.map((venue) => (
            <div key={venue.id} className="bg-white rounded-lg border border-[#E5E7EB] p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                  {venue.image}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{venue.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{venue.type}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    venue.status === 'Published' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-[#B74140]'
                  }`}>
                    {venue.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">category:</span>
                  <span className="text-gray-900 font-medium">{venue.category}</span>
                </div>
               
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price:</span>
                  <span className="text-gray-900 font-bold">${venue.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-900 font-medium">{venue.createdDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                <button onClick={() => HandleEdit(venue.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Edit2  className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
                
                <button className="flex items-center justify-center px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredVenues.length === 0 && (
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-12 text-center">
            <p className="text-gray-500 text-lg">No venues found matching your search.</p>
          </div>
        )}

        {/* Pagination */}
        {filteredVenues.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-[#E5E7EB] p-4">
            <div className="text-sm text-gray-600">
              SHOWING {startIndex + 1}-{Math.min(endIndex, filteredVenues.length)} OF {filteredVenues.length}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-2 text-gray-400">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page as number)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-[#B74140] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}