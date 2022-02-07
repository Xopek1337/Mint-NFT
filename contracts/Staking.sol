// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Staking is Ownable {
    IERC20 public rewardsToken;
    IERC721 public stakingToken;

    bool public isPaused = false;

    uint public period = 1 days; 
    uint public rewardRate = 100; 
    uint public stakedTokens = 0;

    mapping(uint => address) public stakes;
    mapping(address => uint) public stakersBalances;

    event Staked(address indexed user, uint[] ids);
    event Unstaked(address indexed user, uint[] ids);

    constructor(address _rewardsToken, address _stakingToken) {
        rewardsToken = IERC20(_rewardsToken);
        stakingToken = IERC721(_stakingToken);
    }

    function stake(uint[] memory ids) external returns(uint[] memory) {
        require(!isPaused, 'Staking::stake: staking is closed');

        for (uint i = 0; i < ids.length; i++) {
            require(msg.sender == stakingToken.ownerOf(ids[i]), 'Staking::stake: only token owner can stake'); 
            require(stakes[ids[i]] != msg.sender, 'Staking::stake: token is already staked'); 
            
            stakingToken.transferFrom(msg.sender, address(this), ids[i]);

            stakersBalances[msg.sender]++;
            stakes[ids[i]] = msg.sender;
            stakedTokens++;
        }

        emit Staked(msg.sender, ids);
        
        return ids;
    }

    function unstake(uint[] memory ids) external returns(uint[] memory) {
        for (uint i = 0; i < ids.length; i++) {
            require(msg.sender == stakes[ids[i]], 'Staking::unstake: msg.sender is not token owner');

            stakingToken.transferFrom(address(this), msg.sender, ids[i]); 

            stakes[i] = stakes[ids.length - 1];
            delete stakes[i];

            stakersBalances[msg.sender]--;
            stakedTokens--;
        }

        emit Unstaked(msg.sender, ids);

        return ids;
    }

    function _withdraw(uint[] memory ids)
        external 
        onlyOwner 
        returns(bool) 
    {
        for (uint i = 0; i < ids.length; i++) {
            stakingToken.transferFrom(address(this), msg.sender, ids[i]);
        }

        return true;
    }

     function _setPause(bool _isPaused)
        external
        onlyOwner
        returns (bool)
    {
        isPaused = _isPaused;

        return true;
    }
}