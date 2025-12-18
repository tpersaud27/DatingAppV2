using System.Security.Claims;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class MembersController(IMemberRepository memberRepository) : BaseApiController
    {
        // Action Result allows us to return a HTTP Response
        // Task allows us to return a async operation
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Member>>> GetMembers()
        {
            return Ok(await memberRepository.GetMembersAsync());
        }

        [HttpGet("{id}")] //api/members/id
        public async Task<ActionResult<Member>> GetMember(string id)
        {
            var member = await memberRepository.GetMemberByIdAsync(id);

            // If the member is not found we return a 404 http response
            if (member == null)
            {
                return NotFound();
            }

            return member;
        }

        [HttpGet("{id}/photos")] // api/members/{id}/photos
        public async Task<ActionResult<IReadOnlyList<Photo>>> GetMemberPhotos(string id)
        {
            return Ok(await memberRepository.GetPhotosForMemberAsync(id));
        }

        [HttpPut]
        public async Task<ActionResult> UpdateMember(MemberUpdateDTO memberUpdateDTO)
        {
            var memberId = User.GetMemberId();

            var member = await memberRepository.GetMemberForUpdate(memberId);

            if (member == null)
            {
                return BadRequest("Could not get member");
            }

            member.DisplayName = memberUpdateDTO.DisplayName ?? member.DisplayName;
            member.Description = memberUpdateDTO.Description ?? member.Description;
            member.City = memberUpdateDTO.City ?? member.City;
            member.Country = memberUpdateDTO.Country ?? member.Country;

            // We also update the User entity displayName as well
            member.User.DisplayName = memberUpdateDTO.DisplayName ?? member.User.DisplayName;

            // This is optional because we will be checking if the member has changed
            // We will check on the front-end but this is good to have anyways
            memberRepository.Update(member);

            // Saving the changes to our DB
            if (await memberRepository.SaveAllAsync())
            {
                return NoContent();
            }

            return BadRequest("Failed to update member");
        }
    }
}
