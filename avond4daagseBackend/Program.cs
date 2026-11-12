using Avond4DaagseBackend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IEvenementService, EvenementService>();
builder.Services.AddScoped<IRouteService, RouteService>();
builder.Services.AddScoped<ISponsorService, SponsorService>();
builder.Services.AddScoped<IInschrijvingService, InschrijvingService>();
builder.Services.AddScoped<ITransactieService, TransactieService>();
builder.Services.AddScoped<IContactvraagService, ContactvraagService>();
builder.Services.AddScoped<IGebruikerService, GebruikerService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();