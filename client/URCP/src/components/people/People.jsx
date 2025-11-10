import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigationbar from "@/components/shared/Navigationbar";
import PeopleCard from "./PeopleCard";
import { USER_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";

export default function People() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${USER_API_END_POINT}/all`, { withCredentials: true });
        if (res.data?.success) {
          setPeople(res.data.users || res.data.data || []);
        } else {
          toast.error(res.data?.message || "Failed to load people");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error loading people");
      } finally {
        setLoading(false);
      }
    };
    fetchPeople();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigationbar />
      <div className="max-w-6xl mx-auto mt-28 px-4 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">People</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : people.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No people found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Try again later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.map((p) => (
              <PeopleCard key={p._id} user={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}