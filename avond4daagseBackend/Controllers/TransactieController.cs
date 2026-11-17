namespace Avond4DaagseBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class TransactieController(
    ITransactieService transactieService
    ) : ControllerBase
{
    [Authorize(Roles = "Penningmeester")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transactie>>> GetTransacties()
    {
        var transacties = await transactieService.GetAllTransacties();
        return Ok(transacties);
    }

    [Authorize(Roles = "Penningmeester")]
    [HttpGet("{id}")]
    public async Task<ActionResult<Transactie>> GetTransactie(int id)
    {
        var transactie = await transactieService.GetTransactieById(id);
        if (transactie == null)
        {
            return NotFound();
        }
        return Ok(transactie);
    }
    
    [Authorize(Roles = "Penningmeester")]
    [HttpPost]
    public async Task<ActionResult<Transactie>> CreateTransactie(CreateTransactieDto transactieDto)
    {
        var createdTransactie = await transactieService.CreateTransactie(transactieDto);
        return CreatedAtAction(nameof(GetTransactie), new { id = createdTransactie.TransactieId }, createdTransactie);
    }
    
    [Authorize(Roles = "Penningmeester")]
    [HttpPut("{id}")]
    public async Task<ActionResult<Transactie>> UpdateTransactie(int id, UpdateTransactieDto transactieDto)
    {
        var updatedTransactie = await transactieService.UpdateTransactie(id, transactieDto);
        if (updatedTransactie == null)
        {
            return NotFound();
        }

        return Ok(updatedTransactie);
    }

    [Authorize(Roles = "Penningmeester")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTransactie(int id)
    {
        var transactie = await transactieService.GetTransactieById(id);
        if (transactie == null)
        {
            return NotFound();
        }
        await transactieService.DeleteTransactie(id);
        return NoContent();
    }
}