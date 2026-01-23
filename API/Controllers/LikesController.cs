using API.Data;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class LikesController(ILikesRepository likesRepository, IMemberAccessor memberAccessor) : BaseApiController
    {
        [HttpPost("{targetMemberId}")]
        public async Task<ActionResult> ToggleLike(string targetMemberId)
        {
            var sourceMember = await memberAccessor.GetCurrentMemberForUpdateAsync();
            var sourceMemberId = sourceMember.Id;

            if (sourceMemberId == targetMemberId)
                return BadRequest("You cannot like yourself");

            var existingLike = await likesRepository.GetMemberLike(sourceMemberId, targetMemberId);

            // If this is not an existing like, we add to table
            if (existingLike == null)
            {
                var like = new MemberLike
                {
                    SourceMemberId = sourceMemberId,
                    TargetMemberId = targetMemberId,
                };

                likesRepository.AddLike(like);
            }
            else
            {
                likesRepository.DeleteLike(existingLike);
            }

            if (await likesRepository.SaveAllChanges())
                return Ok();

            return BadRequest("Failed to update like");
        }

        [HttpGet("list")]
        public async Task<ActionResult<IReadOnlyList<string>>> GetCurrentMemberLikeIds()
        {
            var currentMember = await memberAccessor.GetCurrentMemberAsync();
            return Ok(await likesRepository.GetCurrentMemberLikeIds(currentMember.Id));
        }

        [HttpGet] //api/likes
        public async Task<ActionResult<IReadOnlyList<Member>>> GetMemberLikes(string predicate)
        {
            var currentMember = await memberAccessor.GetCurrentMemberAsync();
            var members = await likesRepository.GetMemberLikes(predicate, currentMember.Id);
            return Ok(members);
        }
    }
}
