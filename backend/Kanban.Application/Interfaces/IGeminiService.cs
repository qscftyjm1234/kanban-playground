namespace Kanban.Application.Interfaces
{
    public interface IGeminiService
    {
        Task<string> RefineTaskDescriptionAsync(string description);
    }
}
