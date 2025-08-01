import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Video, 
  Image, 
  Gamepad2, 
  Search, 
  Filter,
  Clock,
  Coins,
  Play,
  SlidersHorizontal
} from "lucide-react";

interface AdCategoriesProps {
  ads: any[];
  onAdSelect: (ad: any) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export default function AdCategories({ ads, onAdSelect, selectedCategory = "all", onCategoryChange }: AdCategoriesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("earnings"); // earnings, duration, title

  // Get unique categories from ads
  const categories = [
    { id: "all", name: "All Categories", icon: Filter, count: ads.length },
    { id: "video", name: "Video Ads", icon: Video, count: ads.filter(ad => ad.type === "video").length },
    { id: "banner", name: "Banner Ads", icon: Image, count: ads.filter(ad => ad.type === "banner").length },
    { id: "interactive", name: "Interactive", icon: Gamepad2, count: ads.filter(ad => ad.type === "interactive").length },
  ];

  // Filter and sort ads
  const filteredAds = ads
    .filter(ad => {
      const matchesCategory = selectedCategory === "all" || ad.type === selectedCategory;
      const matchesSearch = searchTerm === "" || 
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "earnings":
          return parseFloat(b.earnings) - parseFloat(a.earnings);
        case "duration":
          return a.duration - b.duration;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const getAdTypeIcon = (type: string) => {
    switch (type) {
      case "video": return Video;
      case "banner": return Image;
      case "interactive": return Gamepad2;
      default: return Play;
    }
  };

  const getEarningsColor = (earnings: string) => {
    const amount = parseFloat(earnings);
    if (amount >= 5) return "text-green-600 bg-green-100";
    if (amount >= 3) return "text-blue-600 bg-blue-100";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search ads by title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="earnings">Highest Earnings</option>
                <option value="duration">Shortest Duration</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange?.(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.name}
              <Badge variant={isSelected ? "secondary" : "outline"} className="ml-1">
                {category.count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAds.map((ad) => {
          const Icon = getAdTypeIcon(ad.type);
          
          return (
            <Card key={ad.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <Badge variant="outline" className="text-xs">
                        {ad.category}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={`${getEarningsColor(ad.earnings)} font-bold`}>
                    <Coins className="h-3 w-3 mr-1" />
                    ₹{ad.earnings}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {ad.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {ad.duration}s
                  </div>
                  <div className="capitalize text-xs bg-gray-100 px-2 py-1 rounded">
                    {ad.type}
                  </div>
                </div>
                
                <Button 
                  onClick={() => onAdSelect(ad)}
                  className="w-full"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Watch Ad
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAds.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">No ads found</h3>
                <p className="text-gray-600 mt-1">
                  Try adjusting your search terms or category filter.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  onCategoryChange?.("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {filteredAds.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {filteredAds.length} of {ads.length} available ads
        </div>
      )}
    </div>
  );
}