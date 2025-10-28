using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MembersController(AppDbContext context) : ControllerBase
    {
        // Action Result allows us to return a HTTP Response
        // Task allows us to return a async operation
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<AppUser>>> GetMembers()
        {
            var Members = await context.Users.ToListAsync();

            return Members;
        }

        [HttpGet("{id}")] //api/members/id
        public async Task<ActionResult<AppUser>> GetMember(string id)
        {
            var member = await context.Users.FindAsync(id);

            // If the member is not found we return a 404 http response
            if (member == null)
            {
                return NotFound();
            }

            return member;
        }
    }
}
