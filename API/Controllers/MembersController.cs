using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class MembersController(IMemberRepository memberRepository, IConfiguration config)
        : BaseApiController
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
            var photos = await memberRepository.GetPhotosForMemberAsync(id);

            var cloudFrontBaseUrl = config["CloudFront:BaseUrl"];

            var photoDtos = photos
                .Select(p => new PhotoDTO
                {
                    Id = p.Id,
                    Url = p.S3Key == "external" ? p.Url : $"{cloudFrontBaseUrl}/{p.S3Key}",
                    IsMain = p.IsMain,
                })
                .ToList();
            return Ok(photoDtos);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateMember(MemberUpdateDTO memberUpdateDTO)
        {
            // 1) Get Cognito sub from JWT
            var authUserId = User.GetAuthUserId();

            var member = await memberRepository.GetMemberForUpdateByAuthUserId(authUserId);

            if (member == null)
            {
                return BadRequest("Could not get member");
            }

            member.DisplayName = memberUpdateDTO.DisplayName ?? member.DisplayName;
            member.Description = memberUpdateDTO.Description ?? member.Description;
            member.City = memberUpdateDTO.City ?? member.City;
            member.Country = memberUpdateDTO.Country ?? member.Country;

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
