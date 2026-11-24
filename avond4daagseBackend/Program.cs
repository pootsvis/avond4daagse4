using Avond4DaagseBackend.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Avond4DaagseBackend.Models;
using Microsoft.AspNetCore.Identity;

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
builder.Services.AddScoped<IRolService, RolService>();
builder.Services.AddScoped<IRechtService, RechtService>();
builder.Services.AddScoped<IDraaiboektaakService, DraaiboektaakService>();
builder.Services.AddScoped<IVrijwilligerService, VrijwilligerService>();
builder.Services.AddScoped<ITaakToewijzingService, TaakToewijzingService>();
builder.Services.AddScoped<IPasswordHasher<Gebruiker>, PasswordHasher<Gebruiker>>();
builder.Services.AddScoped<IDeelnemerService, DeelnemerService>();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        // een API redirect niet naar een loginpagina, maar geeft 401 of 403
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();
app.UseAuthentication();
app.UseAuthorization();

app.Run();