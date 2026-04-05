using System.Text;
using System.Text.Json;
using Kanban.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Kanban.Application.Services
{
    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _model = "gemini-1.5-flash";

        public GeminiService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _apiKey = config["Gemini:ApiKey"] ?? string.Empty;
        }

        public async Task<string> RefineTaskDescriptionAsync(string description)
        {
            if (string.IsNullOrEmpty(_apiKey))
                return description + " (AI Refinement skipped: API Key missing)";

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = $"Please refine and improve the following Kanban task description to be more professional and clear. Keep the language consistent with the input:\n\n{description}" }
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync(url, content);
                response.EnsureSuccessStatusCode();

                var responseJson = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseJson);
                var refinedText = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return refinedText ?? description;
            }
            catch (Exception ex)
            {
                return $"{description}\n\n(AI Error: {ex.Message})";
            }
        }
    }
}
