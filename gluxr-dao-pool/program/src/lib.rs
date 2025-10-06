use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("ReplaceWithProgramID");

#[program]
pub mod gluxr_dao_pool {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.total_deposits = 0;
        pool.treasury = ctx.accounts.treasury.key();
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        let member_balance = token::accessor::amount(&ctx.accounts.member_token_account)?;
        require!(member_balance > 0, ErrorCode::NotMember);

        let cpi_accounts = Transfer {
            from: ctx.accounts.member_token_account.to_account_info(),
            to: ctx.accounts.pool_vault.to_account_info(),
            authority: ctx.accounts.member_signer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new(cpi_program, cpi_accounts), amount)?;

        ctx.accounts.pool.total_deposits += amount;
        ctx.accounts.member.deposited += amount;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(ctx.accounts.member.deposited >= amount, ErrorCode::InsufficientFunds);
        ctx.accounts.member.deposited -= amount;
        ctx.accounts.pool.total_deposits -= amount;

        let seeds = &[b"vault", ctx.accounts.pool.key().as_ref()];
        let (vault_signer, bump) = Pubkey::find_program_address(seeds, ctx.program_id);
        require!(vault_signer == ctx.accounts.pool_signer.key(), ErrorCode::InvalidVaultSigner);
        let signer_seeds: &[&[u8]] = &[b"vault", ctx.accounts.pool.key().as_ref(), &[bump]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.pool_vault.to_account_info(),
            to: ctx.accounts.member_token_account.to_account_info(),
            authority: ctx.accounts.pool_signer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new_with_signer(cpi_program, cpi_accounts, &[&signer_seeds[..]]), amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(init, payer = signer, space = 8 + 8 + 32)]
    pub pool: Account<'info, Pool>,
    /// CHECK: treasury is a signer storing address
    #[account(mut)]
    pub treasury: Signer<'info>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(init_if_needed, payer = member_signer, space = 8 + 8 + 8)]
    pub member: Account<'info, Member>,
    #[account(mut)]
    pub member_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_vault: Account<'info, TokenAccount>,
    pub member_signer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub member: Account<'info, Member>,
    #[account(mut)]
    pub member_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_vault: Account<'info, TokenAccount>,
    /// CHECK: PDA signer for vault
    pub pool_signer: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Pool {
    pub total_deposits: u64,
    pub treasury: Pubkey,
}

#[account]
pub struct Member {
    pub deposited: u64,
    pub joined_at: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You must hold $gLUXR to interact with this pool.")]
    NotMember,
    #[msg("Insufficient funds to withdraw.")]
    InsufficientFunds,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid vault signer")]
    InvalidVaultSigner,
}
