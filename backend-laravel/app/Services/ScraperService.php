<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Symfony\Component\DomCrawler\Crawler;
use App\Models\Article;
use Carbon\Carbon;
use Illuminate\Support\Str;

class ScraperService
{
    private $baseUrl = 'https://beyondchats.com/blogs';

    public function scrapeAndStoreOldest()
    {
        // 1. Find last page
        $lastPage = 1;
        
        // Check page 1 to see if we can find pagination numbers
        $response = Http::get($this->baseUrl);
        if ($response->successful()) {
            $crawler = new Crawler($response->body());
            
            // Try to find the max page number from pagination links
            // Selectors: .page-numbers (WordPress), .pagination
            $pageLinks = $crawler->filter('.page-numbers, .pagination a')->each(function (Crawler $node) {
                 return (int) $node->text();
            });
            
            // Filter 0s
            $pageLinks = array_filter($pageLinks);
            
            if (!empty($pageLinks)) {
                $lastPage = max($pageLinks);
            } else {
                 // Fallback: incremental check
                 // We'll try up to 20 pages
                 for ($i = 2; $i <= 20; $i++) {
                     $check = Http::get($this->baseUrl . '/page/' . $i . '/');
                     if ($check->status() == 404) {
                         break;
                     }
                     $lastPage = $i;
                 }
            }
        }

        // 2. Fetch the last page
        $targetUrl = $lastPage > 1 ? $this->baseUrl . '/page/' . $lastPage . '/' : $this->baseUrl . '/';
        $response = Http::get($targetUrl);
        
        if ($response->failed()) {
            // Fallback to page 1 if last page fail?
            return [];
        }

        // 3. Parse Articles from the list
        $crawler = new Crawler($response->body());
        
        // Selectors for article cards
        $articlesData = $crawler->filter('article, .post-card, .blog-post, .post')->each(function (Crawler $node) {
            $titleNode = $node->filter('h2, h3, .entry-title a, .post-title a')->first();
            $linkNode = $titleNode->count() > 0 ? $titleNode : $node->filter('a')->first(); // Fallback
            
            if ($titleNode->count() > 0) {
                 $url = $linkNode->attr('href');
                 $title = $titleNode->text();
                 return [
                    'title' => $title,
                    'source_url' => $url,
                 ];
            }
            return null;
        });

        $articlesData = array_filter($articlesData);
        
        // 4. Get the 5 OLDEST
        // Assuming the list is Descending (Newest -> Oldest).
        // The articles at the BOTTOM of the Last Page are the oldest.
        // We take the last 5 elements of the array.
        $oldestData = array_slice($articlesData, -5);

        $storedArticles = [];

        foreach ($oldestData as $data) {
            // Check if exists
            if (Article::where('source_url', $data['source_url'])->exists()) {
                continue;
            }

            // 5. Visit each article to get content
            $detailRes = Http::get($data['source_url']);
            if ($detailRes->successful()) {
                $detailCrawler = new Crawler($detailRes->body());
                
                // Content selectors
                // WordPress: .entry-content, .post-content
                $content = '';
                $contentNode = $detailCrawler->filter('.entry-content, .post-content, article .content')->first();
                if ($contentNode->count() > 0) {
                    $content = $contentNode->html();
                } else {
                    $content = $detailRes->body(); // Fallback: raw body (rarely wise but safe)
                }

                $article = Article::create([
                    'title' => $data['title'],
                    'slug' => Str::slug($data['title']) . '-' . rand(1000,9999), // Ensure unique slug
                    'source_url' => $data['source_url'],
                    'original_content' => $content,
                    'status' => 'original',
                ]);
                $storedArticles[] = $article;
            }
        }

        return $storedArticles;
    }
}
