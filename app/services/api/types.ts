/**
 * These types indicate the shape of the data you expect to receive from your
 * API endpoint, assuming it's a JSON object like we have.
 */
export interface EpisodeItem {
  author: string;
  categories: string[];
  content: string;
  description: string;
  enclosure: {
    link: string;
    type: string;
    length: number;
    duration: number;
    rating: { scheme: string; value: string };
  };
  guid: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  title: string;
}

export interface ApiFeedResponse {
  feed: {
    url: string;
    title: string;
    link: string;
    author: string;
    description: string;
    image: string;
  };
  items: EpisodeItem[];
  status: string;
}

/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number;
  /**
   * The URL of the api.
   */
  url: string;
}
