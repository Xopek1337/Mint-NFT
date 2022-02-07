// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import './ERC721Mint.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Staking is Ownable {
    IERC20 public rewardsToken;
    ERC721Mint public stakingToken;

    bool public isPaused = false;

    uint public period = 1 days; // variable
    uint public rewardRate = 100; // variable
    uint public stakedTokens;

    mapping(uint => address) public stakes;
    mapping(address => uint) public stakersBalances;

    event Staked(address indexed user, uint[] ids);
    event Unstaked(address indexed user, uint[] ids);

    constructor(address _rewardsToken, address _stakingToken) {
        rewardsToken = IERC20(_rewardsToken);
        stakingToken = ERC721Mint(_stakingToken);
    }

    function stake(uint[] memory ids) external returns(uint[] memory) {
        require(!isPaused, 'Staking::stake: staking is closed');

        for (uint i = 0; i < ids.length; i++) {
            require(msg.sender == stakingToken.ownerOf(ids[i]), 'Staking::stake: only token owner can stake'); // проверка на владение токеном
            require(stakes[ids[i]] != msg.sender, 'Staking::stake: token is already staked'); // проверка не стейкал ли уже юзер этот токен
            // если существует ячейка, конечно же, так-то можно if дописать
            //stakingToken.approve(address(this), ids[i]);
            
            stakingToken.transferFrom(msg.sender, address(this), ids[i]); // уменьшается ли здесь баланс юзера в ERC721Mint? или надо дописать

            stakersBalances[msg.sender]++;
            stakes[ids[i]] = msg.sender;
            stakedTokens++;
        }

        emit Staked(msg.sender, ids);
        
        return ids;
    }

    function unstake(uint[] memory ids) external returns(uint[] memory) {
        for (uint i = 0; i < ids.length; i++) {
            //require(msg.sender == stakes[ids[i]], 'Staking::unstake: msg.sender is not token owner'); // чекает что владелец тот кто стейкнул

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