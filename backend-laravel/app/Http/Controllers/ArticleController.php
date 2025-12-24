<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use App\Services\ScraperService;

class ArticleController extends Controller
{
    public function index()
    {
        return Article::orderBy('created_at', 'desc')->paginate(10);
    }

    public function show($id)
    {
        return Article::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required',
            'slug' => 'required|unique:articles',
            'original_content' => 'required',
            'source_url' => 'required',
            'status' => 'in:original,updated',
        ]);
        
        return Article::create($validated);
    }

    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);
        
        // Allow updating updated_content, references, status
        $article->update($request->all());
        
        return response()->json($article);
    }

    public function destroy($id)
    {
        Article::destroy($id);
        return response()->noContent();
    }

    public function latest()
    {
        // Return the single most recent article
        $article = Article::latest()->first();
        if (!$article) {
            return response()->json(['message' => 'No articles found'], 404);
        }
        return response()->json($article);
    }
    
    public function scrape(ScraperService $scraper)
    {
        $articles = $scraper->scrapeAndStoreOldest();
        return response()->json([
            'message' => 'Scrape completed',
            'count' => count($articles),
            'data' => $articles
        ]);
    }
}
