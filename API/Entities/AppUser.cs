namespace API.Entities
{
    public class AppUser
    {
        // This will be our primary key in our database
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string? DisplayName { get; set; }
        public string? Email { get; set; }
    }
}
