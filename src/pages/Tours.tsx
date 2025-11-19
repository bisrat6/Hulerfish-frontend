import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TourCard from "@/components/TourCard";
import PageHeader from "@/components/PageHeader";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { experiencesAPI } from "@/lib/api";
import { motion } from "framer-motion";

const Tours = () => {
  const [sort, setSort] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 8; // Fixed limit - 8 per page
  const [experiences, setExperiences] = useState<Array<Record<string, unknown>>>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: Record<string, unknown> = {};
        if (sort) params.sort = sort;
        params.page = page;
        params.limit = limit;
        const response = await experiencesAPI.getAll(params);
        const experiencesData = response.data.data || response.data || [];
        setExperiences(experiencesData);
        // Calculate total pages - check various possible response structures
        const total = response.data.total || 
                     response.data.totalDocs || 
                     response.data.count ||
                     (experiencesData.length < limit ? experiencesData.length : experiencesData.length + 1);
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
      } catch (err: any) {
        console.error("Failed to fetch experiences:", err);
        let errorMessage = "Failed to load experiences from server. Please try again later.";
        if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error') || !err.response) {
          errorMessage = "Cannot connect to server. Please check if the backend is running.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        setError(errorMessage);
        setExperiences([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, [sort, page]);

  // Experiences are already filtered in useEffect
  const filteredExperiences = experiences;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-16">
        {/* Header */}
        <PageHeader
          title={
            <>
              Discover Authentic{" "}
              <span className="text-primary">Home Experiences</span>
            </>
          }
          description="Browse our carefully curated collection of immersive experiences hosted by local families. From traditional coffee ceremonies to hands-on cooking workshops, discover authentic cultural connections."
        />

        {/* Experiences Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-secondary/10 border border-secondary rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                <p className="text-sm text-foreground">{error}</p>
              </motion.div>
            )}

            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredExperiences.length}
                </span>{" "}
                experience
                {filteredExperiences.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-3">
                <label htmlFor="sort" className="text-sm text-muted-foreground whitespace-nowrap">
                  Sort by:
                </label>
                <Select value={sort || "default"} onValueChange={(value) => setSort(value === "default" ? "" : value)}>
                  <SelectTrigger id="sort" className="w-[180px]">
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="-ratingsAverage,price">Top Rated</SelectItem>
                    <SelectItem value="price">Price: Low to High</SelectItem>
                    <SelectItem value="-price">Price: High to Low</SelectItem>
                    <SelectItem value="-createdAt">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-32">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredExperiences.map((experience) => (
                    <TourCard key={experience._id ?? experience.id} tour={experience} />
                  ))}
                </div>

                {/* Pagination - Show if we have experiences or if there might be more pages */}
                {(filteredExperiences.length > 0 || page > 1) && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 7) {
                            pageNum = i + 1;
                          } else if (page <= 4) {
                            pageNum = i + 1;
                          } else if (page >= totalPages - 3) {
                            pageNum = totalPages - 6 + i;
                          } else {
                            pageNum = page - 3 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                              className="w-10"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={filteredExperiences.length < limit && page > 1}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {filteredExperiences.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-xl text-muted-foreground">
                      No experiences found.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Tours;
